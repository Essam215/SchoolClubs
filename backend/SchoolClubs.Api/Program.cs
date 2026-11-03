using System.Text.Json;
using System.Text.Json.Nodes;
using SchoolClubs.Api;

var builder = WebApplication.CreateBuilder(args);
if (builder.Environment.IsDevelopment() && string.IsNullOrWhiteSpace(builder.Configuration["Urls"]))
    builder.WebHost.UseUrls("http://localhost:5080");

builder.Services.Configure<SupabaseOptions>(builder.Configuration.GetSection("Supabase"));
builder.Services.AddHttpClient<Db>();
builder.Services.ConfigureHttpJsonOptions(o => o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower);
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? new[] { "http://localhost:5173" })
    .AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors();

// Turn ApiException into a clean JSON error: { "error": "..." }
app.Use(async (ctx, next) =>
{
    try { await next(); }
    catch (ApiException e)
    {
        ctx.Response.StatusCode = e.Status;
        await ctx.Response.WriteAsJsonAsync(new { error = e.Message });
    }
});

static Guid G(JsonNode? n) => Db.G(n);
static string S(JsonNode? n) => n!.GetValue<string>();
static string Need(string? v, string what) =>
    string.IsNullOrWhiteSpace(v) ? throw new ApiException(400, $"{what} is required.") : v.Trim();

static string NeedHttpUrl(string? value)
{
    var url = Need(value, "URL");
    if (!Uri.TryCreate(url, UriKind.Absolute, out var parsed) ||
        (parsed.Scheme != Uri.UriSchemeHttp && parsed.Scheme != Uri.UriSchemeHttps))
        throw new ApiException(400, "URL must be an absolute HTTP or HTTPS address.");
    return url;
}

static JsonObject Pick(JsonObject body, string[] allowed)
{
    var o = new JsonObject();
    foreach (var f in allowed) if (body.ContainsKey(f)) o[f] = body[f]?.DeepClone();
    return o;
}

app.MapGet("/api/health", () => Results.Ok(new { ok = true }));

// ===== Users & clubs ====================================================

app.MapGet("/api/users", async (Db db) =>
    Results.Ok(await db.Get("users?select=id,full_name,email,role,grade,avatar_color&order=full_name")));

app.MapPost("/api/auth/login", async (LoginIn i, Db db) =>
{
    var email = Need(i.Email, "Email").ToLowerInvariant();
    var user = await db.One($"users?email=eq.{Uri.EscapeDataString(email)}&select=*");
    return user is null
        ? Results.NotFound(new { error = "No account uses that email." })
        : Results.Ok(user);
});

app.MapGet("/api/clubs", async (HttpContext c, Db db) =>
{
    await db.Me(c);
    return Results.Ok(await db.Get(
        "clubs?select=id,name,description,category,color,advisor_id,club_members(user_id,role,users(id,full_name,avatar_color))&order=name"));
});

// ===== Events ===========================================================

app.MapGet("/api/events", async (HttpContext c, Db db, Guid? club_id) =>
{
    await db.Me(c);
    var q = "events?select=*,clubs(id,name,color),event_registrations(user_id,status)&order=starts_at.asc";
    if (club_id is not null) q += $"&club_id=eq.{club_id}";
    return Results.Ok(await db.Get(q));
});

app.MapPost("/api/events", async (HttpContext c, Db db, EventIn i) =>
{
    var me = await db.Me(c);
    await db.RequireManage(me, i.ClubId);
    var title = Need(i.Title, "Title");
    if (i.EndsAt <= i.StartsAt) throw new ApiException(400, "The end time must be after the start time.");

    var created = (await db.Insert("events", new Dictionary<string, object?>
    {
        ["club_id"] = i.ClubId, ["title"] = title, ["description"] = i.Description, ["location"] = i.Location,
        ["starts_at"] = i.StartsAt, ["ends_at"] = i.EndsAt, ["capacity"] = i.Capacity,
        ["status"] = "upcoming", ["created_by"] = G(me["id"])
    }))[0]!;

    var club = await db.One($"clubs?id=eq.{i.ClubId}&select=name");
    var others = (await db.ClubMembers(i.ClubId)).Where(m => m != G(me["id"]));
    await db.Notify(others, "event", $"New event: {title}",
        $"{S(club!["name"])} is hosting this on {i.StartsAt:ddd d MMM}{(string.IsNullOrWhiteSpace(i.Location) ? "" : " at " + i.Location)}.", "events");
    return Results.Ok(created);
});

app.MapPut("/api/events/{id:guid}", async (HttpContext c, Db db, Guid id, JsonObject body) =>
{
    var me = await db.Me(c);
    var ev = await db.One($"events?id=eq.{id}&select=*") ?? throw new ApiException(404, "Event not found.");
    await db.RequireManage(me, G(ev["club_id"]));

    var patch = Pick(body, new[] { "title", "description", "location", "starts_at", "ends_at", "capacity", "status" });
    if (patch.ContainsKey("status") && S(patch["status"]) is not ("upcoming" or "completed" or "cancelled"))
        throw new ApiException(400, "Unknown event status.");
    if (patch.Count == 0) throw new ApiException(400, "Nothing to update.");

    var updated = (await db.Patch($"events?id=eq.{id}", patch))[0]!;

    var registrants = (await db.List($"event_registrations?event_id=eq.{id}&select=user_id"))
        .Select(r => G(r!["user_id"])).Where(u => u != G(me["id"]));
    var cancelled = patch.ContainsKey("status") && S(patch["status"]) == "cancelled";
    var title = S(updated["title"]);
    await db.Notify(registrants, "event",
        cancelled ? $"Event cancelled: {title}" : $"Event updated: {title}",
        cancelled ? "The organisers cancelled this event." : "Check the new date, time or location.", "events");
    return Results.Ok(updated);
});

app.MapDelete("/api/events/{id:guid}", async (HttpContext c, Db db, Guid id) =>
{
    var me = await db.Me(c);
    var ev = await db.One($"events?id=eq.{id}&select=club_id,title") ?? throw new ApiException(404, "Event not found.");
    await db.RequireManage(me, G(ev["club_id"]));
    var registrants = (await db.List($"event_registrations?event_id=eq.{id}&select=user_id"))
        .Select(r => G(r!["user_id"])).Where(u => u != G(me["id"]));
    await db.Delete($"events?id=eq.{id}");
    await db.Notify(registrants, "event", $"Event removed: {S(ev["title"])}", "This event is no longer on the calendar.", "events");
    return Results.NoContent();
});

app.MapPost("/api/events/{id:guid}/register", async (HttpContext c, Db db, Guid id) =>
{
    var me = await db.Me(c);
    var ev = await db.One($"events?id=eq.{id}&select=id,title,status,capacity,ends_at,event_registrations(user_id)")
             ?? throw new ApiException(404, "Event not found.");
    if (S(ev["status"]) != "upcoming" || DateTimeOffset.Parse(S(ev["ends_at"])) < DateTimeOffset.UtcNow)
        throw new ApiException(400, "Registration is closed for this event.");

    var regs = ev["event_registrations"]!.AsArray();
    var already = regs.Any(r => S(r!["user_id"]) == S(me["id"]));
    if (!already && ev["capacity"] is JsonNode cap && regs.Count >= cap.GetValue<int>())
        throw new ApiException(409, "This event is full.");

    await db.Insert("event_registrations",
        new Dictionary<string, object?> { ["event_id"] = id, ["user_id"] = G(me["id"]), ["status"] = "registered" },
        upsertOn: "event_id,user_id");
    if (!already)
        await db.Notify(new[] { G(me["id"]) }, "event", "Registration confirmed", $"You're registered for {S(ev["title"])}.", "events");
    return Results.Ok(new { registered = true });
});

app.MapDelete("/api/events/{id:guid}/register", async (HttpContext c, Db db, Guid id) =>
{
    var me = await db.Me(c);
    await db.Delete($"event_registrations?event_id=eq.{id}&user_id=eq.{S(me["id"])}");
    return Results.NoContent();
});

// ===== Tasks ============================================================

app.MapGet("/api/tasks", async (HttpContext c, Db db, Guid? club_id) =>
{
    var me = await db.Me(c);
    var q = "tasks?select=*,clubs(id,name,color),assignee:users!assigned_to(id,full_name,avatar_color),events(id,title)&order=due_date.asc.nullslast";
    if (club_id is not null) q += $"&club_id=eq.{club_id}";

    if (S(me["role"]) != "admin")
    {
        // Everyone else sees tasks only for clubs they belong to or advise.
        var mine = (await db.List($"club_members?user_id=eq.{S(me["id"])}&select=club_id")).Select(r => S(r!["club_id"]))
            .Concat((await db.List($"clubs?advisor_id=eq.{S(me["id"])}&select=id")).Select(r => S(r!["id"])))
            .Distinct().ToList();
        if (mine.Count == 0) return Results.Ok(new JsonArray());
        q += $"&club_id=in.({string.Join(",", mine)})";
    }
    return Results.Ok(await db.Get(q));
});

app.MapPost("/api/tasks", async (HttpContext c, Db db, TaskIn i) =>
{
    var me = await db.Me(c);
    await db.RequireManage(me, i.ClubId);
    var title = Need(i.Title, "Title");
    var priority = i.Priority ?? "medium";
    if (priority is not ("low" or "medium" or "high")) throw new ApiException(400, "Unknown priority.");

    var created = (await db.Insert("tasks", new Dictionary<string, object?>
    {
        ["club_id"] = i.ClubId, ["event_id"] = i.EventId, ["title"] = title, ["description"] = i.Description,
        ["priority"] = priority, ["due_date"] = i.DueDate, ["assigned_to"] = i.AssignedTo,
        ["status"] = "todo", ["created_by"] = G(me["id"])
    }))[0]!;

    if (i.AssignedTo is Guid a && a != G(me["id"]))
        await db.Notify(new[] { a }, "task", $"New task: {title}",
            $"{S(me["full_name"])} assigned you a task{(i.DueDate is null ? "." : $" due {i.DueDate:ddd d MMM}.")}", "tasks");
    return Results.Ok(created);
});

app.MapPatch("/api/tasks/{id:guid}", async (HttpContext c, Db db, Guid id, JsonObject body) =>
{
    var me = await db.Me(c);
    var task = await db.One($"tasks?id=eq.{id}&select=*") ?? throw new ApiException(404, "Task not found.");
    var meId = S(me["id"]);
    var manager = await db.CanManage(me, G(task["club_id"]));
    var isAssignee = task["assigned_to"] is JsonNode at && S(at) == meId;
    if (!manager && !isAssignee) throw new ApiException(403, "Only the assignee or a club manager can change this task.");

    var allowed = manager
        ? new[] { "title", "description", "status", "priority", "due_date", "assigned_to", "event_id" }
        : new[] { "status" };
    var patch = Pick(body, allowed);
    if (patch.Count == 0) throw new ApiException(400, "Nothing to update.");

    if (patch.ContainsKey("status"))
    {
        var st = S(patch["status"]);
        if (st is not ("todo" or "in_progress" or "review" or "done")) throw new ApiException(400, "Unknown task status.");
        patch["completed_at"] = st == "done" ? JsonValue.Create(DateTime.UtcNow) : null;
    }

    var updated = (await db.Patch($"tasks?id=eq.{id}", patch))[0]!;
    var title = S(updated["title"]);

    if (patch.ContainsKey("assigned_to") && patch["assigned_to"] is JsonNode na && S(na) != meId
        && S(na) != (task["assigned_to"]?.GetValue<string>() ?? ""))
        await db.Notify(new[] { G(na) }, "task", $"New task: {title}", $"{S(me["full_name"])} assigned you a task.", "tasks");

    if (patch.ContainsKey("status") && S(patch["status"]) is "review" or "done" && task["created_by"] is JsonNode cb && S(cb) != meId)
        await db.Notify(new[] { G(cb) }, "task",
            S(patch["status"]) == "done" ? "Task completed" : "Task ready for review",
            $"{S(me["full_name"])} moved \"{title}\" to {(S(patch["status"]) == "done" ? "done" : "review")}.", "tasks");

    return Results.Ok(updated);
});

app.MapDelete("/api/tasks/{id:guid}", async (HttpContext c, Db db, Guid id) =>
{
    var me = await db.Me(c);
    var task = await db.One($"tasks?id=eq.{id}&select=club_id") ?? throw new ApiException(404, "Task not found.");
    await db.RequireManage(me, G(task["club_id"]));
    await db.Delete($"tasks?id=eq.{id}");
    return Results.NoContent();
});

// ===== Leaderboard =====================================================

app.MapGet("/api/leaderboard", async (HttpContext c, Db db, string? period, Guid? club_id) =>
{
    await db.Me(c);
    var range = period ?? "all";
    if (range is not ("all" or "month")) throw new ApiException(400, "Unknown leaderboard period.");

    var query = "club_point_awards?select=club_id,user_id,points,created_at,user:users!user_id(id,full_name,avatar_color,grade),clubs(id,name,color)";
    if (club_id is not null) query += $"&club_id=eq.{club_id}";
    if (range == "month")
    {
        var since = Uri.EscapeDataString(DateTimeOffset.UtcNow.AddDays(-30).ToString("O"));
        query += $"&created_at=gte.{since}";
    }

    var rows = await db.List(query);
    var ranked = rows
        .GroupBy(row => S(row!["user_id"]))
        .Select(group =>
        {
            var first = group.First()!.AsObject();
            return new
            {
                user = first["user"]?.DeepClone(),
                points = group.Sum(row => row!["points"]!.GetValue<int>()),
                award_count = group.Count(),
                club_count = group.Select(row => S(row!["club_id"])).Distinct().Count()
            };
        })
        .OrderByDescending(entry => entry.points)
        .ThenBy(entry => S(entry.user!.AsObject()["full_name"]), StringComparer.OrdinalIgnoreCase)
        .Select((entry, index) => new
        {
            rank = index + 1,
            entry.user,
            entry.points,
            entry.award_count,
            entry.club_count
        });

    return Results.Ok(ranked);
});

app.MapPost("/api/leaderboard/awards", async (HttpContext c, Db db, PointAwardIn i) =>
{
    var me = await db.Me(c);
    await db.RequireManage(me, i.ClubId);
    if (i.Points is < 1 or > 100) throw new ApiException(400, "Points must be between 1 and 100.");
    var reason = Need(i.Reason, "Reason");
    if (reason.Length > 160) throw new ApiException(400, "Reason must be 160 characters or fewer.");
    var member = await db.One($"club_members?club_id=eq.{i.ClubId}&user_id=eq.{i.UserId}&select=user_id");
    if (member is null) throw new ApiException(400, "Points can only be awarded to a member of this club.");

    var award = (await db.Insert("club_point_awards", new Dictionary<string, object?>
    {
        ["club_id"] = i.ClubId, ["user_id"] = i.UserId, ["awarded_by"] = G(me["id"]),
        ["points"] = i.Points, ["reason"] = reason
    }))[0]!;
    if (i.UserId != G(me["id"]))
        await db.Notify(new[] { i.UserId }, "system", "You earned leaderboard points",
            $"{S(me["full_name"])} awarded you {i.Points} points: {reason}", "leaderboard");
    return Results.Ok(award);
});

// ===== Resource library ================================================

app.MapGet("/api/resources", async (HttpContext c, Db db, Guid? club_id, string? category) =>
{
    await db.Me(c);
    var query = "resources?select=*,clubs(id,name,color),creator:users!created_by(full_name)&order=created_at.desc";
    if (club_id is not null) query += $"&or=(club_id.is.null,club_id.eq.{club_id})";
    if (!string.IsNullOrWhiteSpace(category))
        query += $"&category=eq.{Uri.EscapeDataString(category.Trim())}";
    return Results.Ok(await db.Get(query));
});

app.MapPost("/api/resources", async (HttpContext c, Db db, ResourceIn i) =>
{
    var me = await db.Me(c);
    await db.RequireManage(me, i.ClubId);
    var title = Need(i.Title, "Title");
    var category = Need(i.Category, "Category");
    if (title.Length > 120 || category.Length > 60)
        throw new ApiException(400, "Title must be 120 characters or fewer and category 60 characters or fewer.");
    if (i.ResourceType is not ("article" or "video" or "document" or "website"))
        throw new ApiException(400, "Unknown resource type.");

    var created = (await db.Insert("resources", new Dictionary<string, object?>
    {
        ["club_id"] = i.ClubId, ["created_by"] = G(me["id"]), ["title"] = title,
        ["description"] = string.IsNullOrWhiteSpace(i.Description) ? null : i.Description.Trim(),
        ["category"] = category, ["resource_type"] = i.ResourceType, ["url"] = NeedHttpUrl(i.Url)
    }))[0]!;
    return Results.Ok(created);
});

app.MapPut("/api/resources/{id:guid}", async (HttpContext c, Db db, Guid id, ResourceIn i) =>
{
    var me = await db.Me(c);
    var existing = await db.One($"resources?id=eq.{id}&select=club_id")
        ?? throw new ApiException(404, "Resource not found.");
    Guid? existingClubId = existing["club_id"] is JsonNode club ? G(club) : null;
    await db.RequireManage(me, existingClubId);
    await db.RequireManage(me, i.ClubId);
    var title = Need(i.Title, "Title");
    var category = Need(i.Category, "Category");
    if (title.Length > 120 || category.Length > 60)
        throw new ApiException(400, "Title must be 120 characters or fewer and category 60 characters or fewer.");
    if (i.ResourceType is not ("article" or "video" or "document" or "website"))
        throw new ApiException(400, "Unknown resource type.");

    var updated = (await db.Patch($"resources?id=eq.{id}", new Dictionary<string, object?>
    {
        ["club_id"] = i.ClubId, ["title"] = title,
        ["description"] = string.IsNullOrWhiteSpace(i.Description) ? null : i.Description.Trim(),
        ["category"] = category, ["resource_type"] = i.ResourceType, ["url"] = NeedHttpUrl(i.Url)
    }))[0]!;
    return Results.Ok(updated);
});

app.MapDelete("/api/resources/{id:guid}", async (HttpContext c, Db db, Guid id) =>
{
    var me = await db.Me(c);
    var resource = await db.One($"resources?id=eq.{id}&select=club_id")
        ?? throw new ApiException(404, "Resource not found.");
    Guid? clubId = resource["club_id"] is JsonNode club ? G(club) : null;
    await db.RequireManage(me, clubId);
    await db.Delete($"resources?id=eq.{id}");
    return Results.NoContent();
});

// ===== Notifications ====================================================

app.MapGet("/api/notifications", async (HttpContext c, Db db, bool? unread) =>
{
    var me = await db.Me(c);
    var q = $"notifications?user_id=eq.{S(me["id"])}&select=*&order=created_at.desc&limit=100";
    if (unread == true) q += "&is_read=eq.false";
    return Results.Ok(await db.Get(q));
});

app.MapGet("/api/notifications/unread-count", async (HttpContext c, Db db) =>
{
    var me = await db.Me(c);
    var rows = await db.List($"notifications?user_id=eq.{S(me["id"])}&is_read=eq.false&select=id");
    return Results.Ok(new { count = rows.Count });
});

app.MapPost("/api/notifications/read-all", async (HttpContext c, Db db) =>
{
    var me = await db.Me(c);
    await db.Patch($"notifications?user_id=eq.{S(me["id"])}&is_read=eq.false", new Dictionary<string, object?> { ["is_read"] = true });
    return Results.NoContent();
});

app.MapPost("/api/notifications/{id:guid}/read", async (HttpContext c, Db db, Guid id) =>
{
    var me = await db.Me(c);
    await db.Patch($"notifications?id=eq.{id}&user_id=eq.{S(me["id"])}", new Dictionary<string, object?> { ["is_read"] = true });
    return Results.NoContent();
});

app.MapDelete("/api/notifications/{id:guid}", async (HttpContext c, Db db, Guid id) =>
{
    var me = await db.Me(c);
    await db.Delete($"notifications?id=eq.{id}&user_id=eq.{S(me["id"])}");
    return Results.NoContent();
});

// ===== Suggestion box ===================================================

app.MapGet("/api/suggestions", async (HttpContext c, Db db) =>
{
    var me = await db.Me(c);
    var meId = S(me["id"]);
    var rows = await db.List(
        "suggestions?select=*,clubs(id,name,color),author:users!author_id(full_name,avatar_color),suggestion_votes(user_id)&order=created_at.desc");
    foreach (var n in rows)
    {
        var o = n!.AsObject();
        var mine = S(o["author_id"]) == meId;
        o["is_mine"] = mine;
        if (o["is_anonymous"]!.GetValue<bool>() && !mine) o["author"] = null; // anonymous stays anonymous
        o.Remove("author_id");
        var votes = o["suggestion_votes"]!.AsArray();
        o["vote_count"] = votes.Count;
        o["voted"] = votes.Any(v => S(v!["user_id"]) == meId);
        o.Remove("suggestion_votes");
    }
    return Results.Ok(rows);
});

app.MapPost("/api/suggestions", async (HttpContext c, Db db, SuggestionIn i) =>
{
    var me = await db.Me(c);
    var title = Need(i.Title, "Title");
    var text = Need(i.Body, "Details");
    var category = i.Category ?? "other";
    if (category is not ("event_idea" or "activity" or "facilities" or "other")) throw new ApiException(400, "Unknown category.");

    var created = (await db.Insert("suggestions", new Dictionary<string, object?>
    {
        ["club_id"] = i.ClubId, ["author_id"] = G(me["id"]), ["category"] = category, ["title"] = title,
        ["body"] = text, ["is_anonymous"] = i.IsAnonymous, ["status"] = "new"
    }))[0]!;

    var staff = (await db.Staff(i.ClubId)).Where(u => u != G(me["id"]));
    var from = i.IsAnonymous ? "Someone" : S(me["full_name"]);
    await db.Notify(staff, "suggestion", "New suggestion", $"{from} suggested \"{title}\".", "suggestions");
    created.AsObject().Remove("author_id");
    return Results.Ok(created);
});

app.MapPost("/api/suggestions/{id:guid}/vote", async (HttpContext c, Db db, Guid id) =>
{
    var me = await db.Me(c);
    var meId = S(me["id"]);
    var existing = await db.One($"suggestion_votes?suggestion_id=eq.{id}&user_id=eq.{meId}&select=user_id");
    if (existing != null) await db.Delete($"suggestion_votes?suggestion_id=eq.{id}&user_id=eq.{meId}");
    else await db.Insert("suggestion_votes", new Dictionary<string, object?> { ["suggestion_id"] = id, ["user_id"] = G(me["id"]) });
    return Results.Ok(new { voted = existing == null });
});

app.MapPatch("/api/suggestions/{id:guid}/respond", async (HttpContext c, Db db, Guid id, RespondIn i) =>
{
    var me = await db.Me(c);
    var s = await db.One($"suggestions?id=eq.{id}&select=*") ?? throw new ApiException(404, "Suggestion not found.");
    Guid? clubId = s["club_id"] is JsonNode cn ? G(cn) : null;
    await db.RequireManage(me, clubId);
    if (i.Status is not ("new" or "under_review" or "accepted" or "rejected" or "implemented"))
        throw new ApiException(400, "Unknown suggestion status.");

    var updated = (await db.Patch($"suggestions?id=eq.{id}", new Dictionary<string, object?>
    {
        ["status"] = i.Status, ["response"] = string.IsNullOrWhiteSpace(i.Response) ? null : i.Response.Trim(),
        ["responded_by"] = G(me["id"]), ["responded_at"] = DateTimeOffset.UtcNow
    }))[0]!;

    var label = i.Status.Replace('_', ' ');
    await db.Notify(new[] { G(s["author_id"]) }, "suggestion", $"Your suggestion is {label}",
        $"\"{S(s["title"])}\" was marked {label}." + (string.IsNullOrWhiteSpace(i.Response) ? "" : " Read the response."), "suggestions");
    updated.AsObject().Remove("author_id");
    return Results.Ok(updated);
});

// ===== Attendance Tracking =============================================

app.MapGet("/api/events/{id:guid}/attendance", async (HttpContext c, Db db, Guid id) =>
{
    var me = await db.Me(c);
    var ev = await db.One($"events?id=eq.{id}&select=id,club_id,title,capacity,starts_at,ends_at")
             ?? throw new ApiException(404, "Event not found.");
    var q = $"event_registrations?event_id=eq.{id}&select=event_id,user_id,status,registered_at,attended_at,user:users!user_id(id,full_name,email,avatar_color,grade)&order=user(full_name).asc";
    return Results.Ok(await db.Get(q));
});

app.MapPatch("/api/events/{id:guid}/attendance/{userId:guid}", async (HttpContext c, Db db, Guid id, Guid userId, AttendanceStatusIn i) =>
{
    var me = await db.Me(c);
    var ev = await db.One($"events?id=eq.{id}&select=club_id,title") ?? throw new ApiException(404, "Event not found.");
    await db.RequireManage(me, G(ev["club_id"]));

    var st = Need(i.Status, "Status").ToLowerInvariant();
    if (st is not ("registered" or "attended" or "late"))
        throw new ApiException(400, "Unknown attendance status.");

    var patch = new Dictionary<string, object?>
    {
        ["status"] = st,
        ["attended_at"] = st == "registered" ? null : DateTimeOffset.UtcNow
    };

    var updated = await db.Patch($"event_registrations?event_id=eq.{id}&user_id=eq.{userId}", patch);
    if (updated.Count == 0) throw new ApiException(404, "Registration not found.");
    return Results.Ok(updated[0]);
});

app.MapPost("/api/events/{id:guid}/attendance/check-in", async (HttpContext c, Db db, Guid id, CheckInIn i) =>
{
    var me = await db.Me(c);
    var ev = await db.One($"events?id=eq.{id}&select=club_id,title") ?? throw new ApiException(404, "Event not found.");
    await db.RequireManage(me, G(ev["club_id"]));

    var user = await db.One($"users?id=eq.{i.UserId}&select=id,full_name") ?? throw new ApiException(404, "User not found.");
    var st = (i.Status?.ToLowerInvariant()) is "late" ? "late" : "attended";

    var upserted = (await db.Insert("event_registrations", new Dictionary<string, object?>
    {
        ["event_id"] = id,
        ["user_id"] = i.UserId,
        ["status"] = st,
        ["attended_at"] = DateTimeOffset.UtcNow
    }, upsertOn: "event_id,user_id"))[0]!;

    return Results.Ok(upserted);
});

// ===== Admissions ======================================================

app.MapGet("/api/admissions", async (HttpContext c, Db db, Guid? club_id, string? status) =>
{
    var me = await db.Me(c);
    var meRole = S(me["role"]);
    var meId = S(me["id"]);

    var q = "club_applications?select=*,clubs(id,name,color),applicant:users!user_id(id,full_name,email,avatar_color,grade),reviewer:users!reviewed_by(id,full_name)&order=created_at.desc";

    if (meRole == "student")
    {
        q += $"&user_id=eq.{meId}";
    }
    else if (meRole != "admin")
    {
        var manageable = (await db.List($"club_members?user_id=eq.{meId}&role=eq.leader&select=club_id"))
            .Select(r => S(r!["club_id"]))
            .Concat((await db.List($"clubs?advisor_id=eq.{meId}&select=id")).Select(r => S(r!["id"])))
            .Distinct().ToList();

        if (club_id is not null)
        {
            await db.RequireManage(me, club_id);
            q += $"&club_id=eq.{club_id}";
        }
        else
        {
            if (manageable.Count > 0)
                q += $"&or=(user_id.eq.{meId},club_id.in.({string.Join(",", manageable)}))";
            else
                q += $"&user_id=eq.{meId}";
        }
    }
    else
    {
        if (club_id is not null) q += $"&club_id=eq.{club_id}";
    }

    if (!string.IsNullOrWhiteSpace(status) && status.ToLowerInvariant() != "all")
        q += $"&status=eq.{status.Trim().ToLowerInvariant()}";

    return Results.Ok(await db.Get(q));
});

app.MapPost("/api/admissions", async (HttpContext c, Db db, ApplicationIn i) =>
{
    var me = await db.Me(c);
    var motivation = Need(i.Motivation, "Motivation");
    var club = await db.One($"clubs?id=eq.{i.ClubId}&select=id,name") ?? throw new ApiException(404, "Club not found.");

    var isMember = await db.One($"club_members?club_id=eq.{i.ClubId}&user_id=eq.{S(me["id"])}&select=user_id");
    if (isMember is not null) throw new ApiException(400, "You are already a member of this club.");

    var existing = await db.One($"club_applications?club_id=eq.{i.ClubId}&user_id=eq.{S(me["id"])}&status=in.(pending,interview)&select=id");
    if (existing is not null) throw new ApiException(400, "You already have an active application under review for this club.");

    var roleApplied = string.IsNullOrWhiteSpace(i.RoleApplied) ? "member" : i.RoleApplied.Trim();
    var created = (await db.Insert("club_applications", new Dictionary<string, object?>
    {
        ["club_id"] = i.ClubId,
        ["user_id"] = G(me["id"]),
        ["role_applied"] = roleApplied,
        ["motivation"] = motivation,
        ["skills"] = string.IsNullOrWhiteSpace(i.Skills) ? null : i.Skills.Trim(),
        ["status"] = "pending"
    }))[0]!;

    var staff = (await db.Staff(i.ClubId)).Where(u => u != G(me["id"]));
    await db.Notify(staff, "system", "New club application",
        $"{S(me["full_name"])} applied to join {S(club["name"])} as {roleApplied}.", "admissions");

    return Results.Ok(created);
});

app.MapDelete("/api/admissions/{id:guid}", async (HttpContext c, Db db, Guid id) =>
{
    var me = await db.Me(c);
    var appRow = await db.One($"club_applications?id=eq.{id}&select=*") ?? throw new ApiException(404, "Application not found.");

    var isApplicant = S(appRow["user_id"]) == S(me["id"]);
    var isAdmin = S(me["role"]) == "admin";
    if (!isApplicant && !isAdmin) throw new ApiException(403, "You can only withdraw your own applications.");
    if (S(appRow["status"]) != "pending" && !isAdmin) throw new ApiException(400, "Only pending applications can be withdrawn.");

    await db.Delete($"club_applications?id=eq.{id}");
    return Results.NoContent();
});

app.MapPatch("/api/admissions/{id:guid}/review", async (HttpContext c, Db db, Guid id, ReviewIn i) =>
{
    var me = await db.Me(c);
    var appRow = await db.One($"club_applications?id=eq.{id}&select=*,clubs(name)") ?? throw new ApiException(404, "Application not found.");
    var clubId = G(appRow["club_id"]);
    await db.RequireManage(me, clubId);

    var newStatus = Need(i.Status, "Status").ToLowerInvariant();
    if (newStatus is not ("approved" or "rejected" or "interview"))
        throw new ApiException(400, "Status must be approved, rejected, or interview.");

    var updated = (await db.Patch($"club_applications?id=eq.{id}", new Dictionary<string, object?>
    {
        ["status"] = newStatus,
        ["feedback"] = string.IsNullOrWhiteSpace(i.Feedback) ? null : i.Feedback.Trim(),
        ["reviewed_by"] = G(me["id"]),
        ["reviewed_at"] = DateTimeOffset.UtcNow
    }))[0]!;

    var clubName = appRow["clubs"]?["name"]?.GetValue<string>() ?? "the club";
    var applicantId = G(appRow["user_id"]);

    if (newStatus == "approved")
    {
        await db.Insert("club_members", new Dictionary<string, object?>
        {
            ["club_id"] = clubId,
            ["user_id"] = applicantId,
            ["role"] = "member"
        }, upsertOn: "club_id,user_id");

        await db.Notify(new[] { applicantId }, "system", "🎉 Application Approved!",
            $"Congratulations! Your application to join {clubName} was approved. Welcome to the club!", "admissions");
    }
    else if (newStatus == "rejected")
    {
        await db.Notify(new[] { applicantId }, "system", "Application update",
            $"Your application to {clubName} was not accepted this term.", "admissions");
    }
    else if (newStatus == "interview")
    {
        await db.Notify(new[] { applicantId }, "system", "Interview Scheduled",
            $"An interview was scheduled for your {clubName} application. Check the feedback notes.", "admissions");
    }

    return Results.Ok(updated);
});

app.Run();

record LoginIn(string? Email);
record EventIn(Guid ClubId, string? Title, string? Description, string? Location, DateTimeOffset StartsAt, DateTimeOffset EndsAt, int? Capacity);
record TaskIn(Guid ClubId, Guid? EventId, string? Title, string? Description, string? Priority, DateOnly? DueDate, Guid? AssignedTo);
record SuggestionIn(Guid? ClubId, string? Title, string? Body, string? Category, bool IsAnonymous);
record RespondIn(string Status, string? Response);
record PointAwardIn(Guid ClubId, Guid UserId, int Points, string? Reason);
record ResourceIn(Guid? ClubId, string? Title, string? Description, string? Category, string? ResourceType, string? Url);
record AttendanceStatusIn(string Status);
record CheckInIn(Guid UserId, string? Status);
record ApplicationIn(Guid ClubId, string? RoleApplied, string Motivation, string? Skills);
record ReviewIn(string Status, string? Feedback);
