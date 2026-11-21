using System.Net;
using System.Net.Http.Headers;
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
    readonly IHttpContextAccessor _context;
    readonly Uri _authUrl;

    public Db(HttpClient http, IOptions<SupabaseOptions> options, IHttpContextAccessor context)
    {
        var o = options.Value;
        if (string.IsNullOrWhiteSpace(o.Url) || string.IsNullOrWhiteSpace(o.Key) ||
            o.Url.Contains("YOUR_PROJECT_REF", StringComparison.OrdinalIgnoreCase) ||
            o.Key.Contains("your-publishable-key", StringComparison.OrdinalIgnoreCase) ||
            !Uri.TryCreate(o.Url, UriKind.Absolute, out var supabaseUri) ||
            (supabaseUri.Scheme != Uri.UriSchemeHttps && supabaseUri.Scheme != Uri.UriSchemeHttp))
        {
            throw new ApiException(503,
                "Supabase isn't configured. Set Supabase:Url and Supabase:Key in appsettings.json or environment variables, then restart the API.");
        }

        _http = http;
        _context = context;
        _authUrl = new Uri(o.Url.TrimEnd('/') + "/auth/v1/");
        _http.BaseAddress = new Uri(o.Url.TrimEnd('/') + "/rest/v1/");
        // Publishable keys are not JWTs, so they go in the apikey header only.
        _http.DefaultRequestHeaders.Add("apikey", o.Key);
    }

    async Task<JsonNode?> Send(HttpMethod method, string path, object? body = null, string? prefer = null, string? tokenOverride = null)
    {
        using var req = new HttpRequestMessage(method, path);
        if (body != null)
            req.Content = new StringContent(JsonSerializer.Serialize(body, body.GetType()), Encoding.UTF8, "application/json");
        if (prefer != null) req.Headers.Add("Prefer", prefer);
        var token = tokenOverride ?? BearerToken(_context.HttpContext);
        if (!string.IsNullOrWhiteSpace(token))
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

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

    public Task<JsonNode?> Get(string path, string? token = null) => Send(HttpMethod.Get, path, tokenOverride: token);

    public async Task<JsonArray> List(string path, string? token = null) => (await Get(path, token))?.AsArray() ?? new JsonArray();

    public async Task<JsonObject?> One(string path, string? token = null)
    {
        var rows = await List(path, token);
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

    // User identity is verified by Supabase Auth, never by an editable user-id header.
    static string? BearerToken(HttpContext? context)
    {
        var authorization = context?.Request.Headers.Authorization.ToString();
        return authorization?.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) == true
            ? authorization[7..].Trim() : null;
    }

    async Task<JsonObject> AuthRequest(HttpMethod method, string route, object? body = null, string? bearer = null)
    {
        using var req = new HttpRequestMessage(method, new Uri(_authUrl, route));
        if (body is not null)
            req.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
        if (!string.IsNullOrWhiteSpace(bearer))
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", bearer);
        using var response = await _http.SendAsync(req);
        var content = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
            throw new ApiException(401, "Supabase authentication failed. Check your credentials or sign in again.");
        return JsonNode.Parse(content)?.AsObject() ?? throw new ApiException(502, "Invalid authentication response.");
    }

    public Task<JsonObject> SignIn(string email, string password) =>
        AuthRequest(HttpMethod.Post, "token?grant_type=password", new { email, password });

    public Task<JsonObject> Refresh(string refreshToken) =>
        AuthRequest(HttpMethod.Post, "token?grant_type=refresh_token", new { refresh_token = refreshToken });

    public async Task<JsonObject> ProfileForToken(string token)
    {
        var authUser = await AuthRequest(HttpMethod.Get, "user", bearer: token);
        var authId = authUser["id"]?.GetValue<string>();
        if (!Guid.TryParse(authId, out var id))
            throw new ApiException(401, "Invalid authentication identity.");
        return await One($"users?auth_user_id=eq.{id}&select=id,full_name,email,role,grade,avatar_color", token)
            ?? throw new ApiException(403, "Your school account has not been linked to Supabase Auth.");
    }

    public async Task<JsonObject> Me(HttpContext c)
    {
        var token = BearerToken(c);
        if (string.IsNullOrWhiteSpace(token))
            throw new ApiException(401, "Sign in to continue.");
        return await ProfileForToken(token);
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
