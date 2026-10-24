using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Options;

namespace SchoolClubs.Api;

public class SupabaseOptions
{
    public string Url { get; set; } = "";
    public string Key { get; set; } = "";
}

public class ApiException(int status, string message) : Exception(message)
{
    public int Status { get; } = status;
}

/// <summary>Thin client over Supabase's PostgREST API plus the permission helpers the endpoints share.</summary>
public class Db
{
    readonly HttpClient _http;

    public Db(HttpClient http, IOptions<SupabaseOptions> options)
    {
        var o = options.Value;
        if (string.IsNullOrWhiteSpace(o.Url) || string.IsNullOrWhiteSpace(o.Key))
            throw new InvalidOperationException("Set Supabase:Url and Supabase:Key in appsettings.json or environment variables.");
        _http = http;
        _http.BaseAddress = new Uri(o.Url.TrimEnd('/') + "/rest/v1/");
        // Publishable keys are not JWTs, so they go in the apikey header only.
        _http.DefaultRequestHeaders.Add("apikey", o.Key);
    }

    async Task<JsonNode?> Send(HttpMethod method, string path, object? body = null, string? prefer = null)
    {
        using var req = new HttpRequestMessage(method, path);
        if (body != null)
            req.Content = new StringContent(JsonSerializer.Serialize(body, body.GetType()), Encoding.UTF8, "application/json");
        if (prefer != null) req.Headers.Add("Prefer", prefer);

        using var res = await _http.SendAsync(req);
        var text = await res.Content.ReadAsStringAsync();
        if (!res.IsSuccessStatusCode)
        {
            var msg = text;
            try { msg = JsonNode.Parse(text)?["message"]?.GetValue<string>() ?? text; } catch { }
            var status = (int)res.StatusCode is >= 400 and < 500 ? 400 : 502;
            if (res.StatusCode == HttpStatusCode.NotFound) status = 404;
            throw new ApiException(status, "Database error: " + msg);
        }
        return string.IsNullOrWhiteSpace(text) ? null : JsonNode.Parse(text);
    }

    public Task<JsonNode?> Get(string path) => Send(HttpMethod.Get, path);

    public async Task<JsonArray> List(string path) => (await Get(path))?.AsArray() ?? new JsonArray();

    public async Task<JsonObject?> One(string path)
    {
        var rows = await List(path);
        return rows.Count == 0 ? null : rows[0]?.AsObject();
    }

    public async Task<JsonArray> Insert(string table, object body, string? upsertOn = null)
    {
        var path = upsertOn is null ? table : $"{table}?on_conflict={upsertOn}";
        var prefer = upsertOn is null ? "return=representation" : "resolution=merge-duplicates,return=representation";
        return (await Send(HttpMethod.Post, path, body, prefer))?.AsArray() ?? new JsonArray();
    }

    public async Task<JsonArray> Patch(string pathWithFilter, object body) =>
        (await Send(HttpMethod.Patch, pathWithFilter, body, "return=representation"))?.AsArray() ?? new JsonArray();

    public Task Delete(string pathWithFilter) => Send(HttpMethod.Delete, pathWithFilter);

    // ---- Identity and permissions -------------------------------------

    public static Guid G(JsonNode? n) => Guid.Parse(n!.GetValue<string>());

    /// <summary>The signed-in user, taken from the X-User-Id header.</summary>
    public async Task<JsonObject> Me(HttpContext c)
    {
        if (!c.Request.Headers.TryGetValue("X-User-Id", out var h) || !Guid.TryParse(h.ToString(), out var id))
            throw new ApiException(401, "Sign in to continue.");
        return await One($"users?id=eq.{id}&select=id,full_name,role")
               ?? throw new ApiException(401, "That account no longer exists. Sign in again.");
    }

    /// <summary>Admins manage everything. Advisors manage their own clubs. Leaders manage clubs they lead.</summary>
    public async Task<bool> CanManage(JsonObject me, Guid? clubId)
    {
        var role = me["role"]!.GetValue<string>();
        var uid = me["id"]!.GetValue<string>();
        if (role == "admin") return true;
        if (clubId is null) return role == "advisor";
        if (role == "advisor") return await One($"clubs?id=eq.{clubId}&advisor_id=eq.{uid}&select=id") != null;
        if (role == "club_leader")
            return await One($"club_members?club_id=eq.{clubId}&user_id=eq.{uid}&role=eq.leader&select=user_id") != null;
        return false;
    }

    public async Task RequireManage(JsonObject me, Guid? clubId)
    {
        if (!await CanManage(me, clubId))
            throw new ApiException(403, "You don't have permission to manage this club.");
    }

    public async Task<List<Guid>> ClubMembers(Guid clubId, bool leadersOnly = false)
    {
        var q = $"club_members?club_id=eq.{clubId}&select=user_id" + (leadersOnly ? "&role=eq.leader" : "");
        return (await List(q)).Select(r => G(r!["user_id"])).ToList();
    }

    /// <summary>Leaders and the advisor of a club. With no club, all admins and advisors.</summary>
    public async Task<List<Guid>> Staff(Guid? clubId)
    {
        var ids = new List<Guid>();
        if (clubId is null)
        {
            ids.AddRange((await List("users?role=in.(admin,advisor)&select=id")).Select(r => G(r!["id"])));
            return ids;
        }
        ids.AddRange(await ClubMembers(clubId.Value, leadersOnly: true));
        var club = await One($"clubs?id=eq.{clubId}&select=advisor_id");
        if (club?["advisor_id"] is JsonNode a) ids.Add(G(a));
        ids.AddRange((await List("users?role=eq.admin&select=id")).Select(r => G(r!["id"])));
        return ids.Distinct().ToList();
    }

    public async Task Notify(IEnumerable<Guid> userIds, string type, string title, string? message, string? link = null)
    {
        var rows = userIds.Distinct().Select(u => new Dictionary<string, object?>
        {
            ["user_id"] = u, ["type"] = type, ["title"] = title, ["message"] = message, ["link"] = link
        }).ToList();
        if (rows.Count > 0) await Insert("notifications", rows);
    }
}
