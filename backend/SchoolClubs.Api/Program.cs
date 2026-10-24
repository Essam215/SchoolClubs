using System.Text.Json;
using System.Text.Json.Nodes;
using SchoolClubs.Api;

var builder = WebApplication.CreateBuilder(args);
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

app.Run();

record LoginIn(string? Email);
record EventIn(Guid ClubId, string? Title, string? Description, string? Location, DateTimeOffset StartsAt, DateTimeOffset EndsAt, int? Capacity);
record TaskIn(Guid ClubId, Guid? EventId, string? Title, string? Description, string? Priority, DateOnly? DueDate, Guid? AssignedTo);
record SuggestionIn(Guid? ClubId, string? Title, string? Body, string? Category, bool IsAnonymous);
record RespondIn(string Status, string? Response);
