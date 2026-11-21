using System.Text.Json.Nodes;

namespace SchoolClubs.Api;

// Local-only, opt-in demo. Uses a JSON file on the developer's machine.
// Never enables Supabase writes and must never be enabled on a public host.
public static class LocalMeetingsDemo
{
    private static readonly object Gate = new();
    private static readonly string DataPath = Path.Combine(AppContext.BaseDirectory, "meetings-local-demo.json");

    public static bool Enabled => Environment.GetEnvironmentVariable("MEETINGS_LOCAL_DEMO") == "1";

    private static JsonObject Load()
    {
        if (!File.Exists(DataPath)) return NewData();
        return JsonNode.Parse(File.ReadAllText(DataPath))?.AsObject() ?? NewData();
    }

    private static JsonObject NewData() => new()
    {
        ["meetings"] = new JsonArray(), ["attendance"] = new JsonArray(), ["notifications"] = new JsonArray()
    };

    private static void Save(JsonObject doc) => File.WriteAllText(DataPath, doc.ToJsonString(new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));
    private static string S(JsonNode? n) => n?.ToString() ?? "";

    public static JsonArray ListMeetings(IEnumerable<Guid> clubIds)
    {
        var allowed = clubIds.Select(x => x.ToString()).ToHashSet(StringComparer.OrdinalIgnoreCase);
        lock (Gate)
        {
            var doc = Load();
            return new JsonArray(doc["meetings"]!.AsArray()
                .Where(x => allowed.Contains(S(x?["club_id"])))
                .OrderByDescending(x => S(x?["starts_at"]))
                .Take(100)
                .Select(x => x!.DeepClone()).ToArray());
        }
    }

    public static JsonObject? Meeting(Guid clubId, DateOnly date, bool onlyScheduled = false)
    {
        lock (Gate)
        {
            var found = Load()["meetings"]!.AsArray().FirstOrDefault(x =>
                S(x?["club_id"]) == clubId.ToString() &&
                S(x?["meeting_date"]) == date.ToString("yyyy-MM-dd") &&
                (!onlyScheduled || S(x?["status"]) == "scheduled"));
            return found?.DeepClone().AsObject();
        }
    }

    public static JsonObject CreateMeeting(Guid clubId, string title, DateOnly date, DateTimeOffset starts, DateTimeOffset ends,
        string mode, string? url, string? location, Guid creatorId, string clubName, IEnumerable<Guid> receivers)
    {
        lock (Gate)
        {
            var doc = Load();
            if (doc["meetings"]!.AsArray().Any(x => S(x?["club_id"]) == clubId.ToString() && S(x?["meeting_date"]) == date.ToString("yyyy-MM-dd")))
                throw new ApiException(409, "A meeting already exists for this club on that date.");
            var created = new JsonObject
            {
                ["id"] = Guid.NewGuid().ToString(), ["club_id"] = clubId.ToString(), ["title"] = title,
                ["meeting_date"] = date.ToString("yyyy-MM-dd"), ["starts_at"] = starts.ToString("O"),
                ["ends_at"] = ends.ToString("O"), ["mode"] = mode, ["meeting_url"] = url,
                ["location"] = location, ["status"] = "scheduled", ["created_by"] = creatorId.ToString(),
                ["created_at"] = DateTimeOffset.UtcNow.ToString("O"),
                ["clubs"] = new JsonObject { ["id"] = clubId.ToString(), ["name"] = clubName }
            };
            doc["meetings"]!.AsArray().Add(created.DeepClone());
            var note = $"{clubName} meeting on {date:yyyy-MM-dd} at {starts:HH:mm}. " +
                (mode == "online" ? $"Join: {url}" : $"Location: {location}");
            AddNotifications(doc, receivers, $"Club meeting: {title}", note);
            Save(doc);
            return created;
        }
    }

    private static void AddNotifications(JsonObject doc, IEnumerable<Guid> recipients, string title, string message)
    {
        foreach (var id in recipients.Distinct())
            doc["notifications"]!.AsArray().Add(new JsonObject
            {
                ["id"] = Guid.NewGuid().ToString(), ["user_id"] = id.ToString(), ["type"] = "event",
                ["title"] = title, ["message"] = message, ["link"] = "meetings",
                ["is_read"] = false, ["created_at"] = DateTimeOffset.UtcNow.ToString("O")
            });
    }

    public static JsonObject Cancel(Guid id, Guid clubId, IEnumerable<Guid> recipients)
    {
        lock (Gate)
        {
            var doc = Load();
            var row = doc["meetings"]!.AsArray().FirstOrDefault(x => S(x?["id"]) == id.ToString() && S(x?["club_id"]) == clubId.ToString());
            if (row is null) throw new ApiException(404, "Meeting not found.");
            if (S(row["status"]) != "cancelled")
            {
                row["status"] = "cancelled";
                AddNotifications(doc, recipients, $"Meeting cancelled: {S(row["title"])}", $"The club meeting on {S(row["meeting_date"])} has been cancelled.");
                Save(doc);
            }
            return row.DeepClone().AsObject();
        }
    }

    public static JsonArray ListAttendance(Guid clubId, DateOnly date)
    {
        lock (Gate)
            return new JsonArray(Load()["attendance"]!.AsArray().Where(x => S(x?["club_id"]) == clubId.ToString() &&
                S(x?["meeting_date"]) == date.ToString("yyyy-MM-dd")).Select(x => x!.DeepClone()).ToArray());
    }

    public static JsonObject MarkAttendance(Guid clubId, Guid userId, DateOnly date, string status)
    {
        lock (Gate)
        {
            var doc = Load();
            var rows = doc["attendance"]!.AsArray();
            var row = rows.FirstOrDefault(x => S(x?["club_id"]) == clubId.ToString() && S(x?["user_id"]) == userId.ToString() &&
                S(x?["meeting_date"]) == date.ToString("yyyy-MM-dd"));
            if (row is null)
            {
                row = new JsonObject { ["club_id"] = clubId.ToString(), ["user_id"] = userId.ToString(),
                    ["meeting_date"] = date.ToString("yyyy-MM-dd") };
                rows.Add(row);
            }
            var now = DateTimeOffset.UtcNow.ToString("O");
            row["status"] = status;
            row["recorded_at"] = now;
            row["attended_at"] = status is "present" or "late" ? now : null;
            Save(doc);
            return row.DeepClone().AsObject();
        }
    }

    public static JsonArray Notifications(Guid userId, bool unreadOnly = false)
    {
        lock (Gate)
            return new JsonArray(Load()["notifications"]!.AsArray()
                .Where(x => S(x?["user_id"]) == userId.ToString() && (!unreadOnly || x?["is_read"]?.GetValue<bool>() == false))
                .OrderByDescending(x => S(x?["created_at"]))
                .Select(x => x!.DeepClone()).ToArray());
    }

    public static bool UpdateNotifications(Guid userId, Guid? notificationId = null, bool delete = false)
    {
        lock (Gate)
        {
            var doc = Load();
            var rows = doc["notifications"]!.AsArray();
            var matches = rows.Where(x => S(x?["user_id"]) == userId.ToString() && (notificationId is null || S(x?["id"]) == notificationId.ToString())).ToList();
            if (matches.Count == 0) return false;
            foreach (var row in matches)
            {
                if (delete) rows.Remove(row);
                else row!["is_read"] = true;
            }
            Save(doc);
            return true;
        }
    }
}
