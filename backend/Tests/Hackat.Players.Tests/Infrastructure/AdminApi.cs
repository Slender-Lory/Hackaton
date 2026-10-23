using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Hackat.Common.Result;
using Hackat.Players.Contracts.Admin;

namespace Hackat.Players.Tests.Infrastructure;

/// <summary>Обёртка над HTTP API администратора.</summary>
public sealed class AdminApi(HttpClient client)
{
    private static readonly JsonSerializerOptions _json = JsonSerializerOptions.Web;

    public Task<ApiResponse<AdminToken>> Login(string login, string password) =>
        Send<AdminToken>(HttpMethod.Post, "/api/v1/admin/login", null, new { login, password });

    public async Task<string> LoginAsAdmin()
    {
        var response = await Login(ApiFixture.AdminLogin, ApiFixture.AdminPassword);
        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        return response.Body.Result!.Token;
    }

    public Task<ApiResponse<PagedResult<AdminPlayerListItemModel>>> Players(
        AuthenticationHeaderValue? auth, string? search = null, int offset = 0, int count = 20)
    {
        var query = $"offset={offset}&count={count}" + (search is null ? "" : $"&search={Uri.EscapeDataString(search)}");
        return Send<PagedResult<AdminPlayerListItemModel>>(HttpMethod.Get, $"/api/v1/admin/players?{query}", auth);
    }

    public Task<ApiResponse<AdminPlayerDetailsModel>> Player(AuthenticationHeaderValue? auth, Guid id) =>
        Send<AdminPlayerDetailsModel>(HttpMethod.Get, $"/api/v1/admin/players/{id}", auth);

    public Task<ApiResponse<AdminStatsModel>> Stats(AuthenticationHeaderValue? auth) =>
        Send<AdminStatsModel>(HttpMethod.Get, "/api/v1/admin/stats", auth);

    public static AuthenticationHeaderValue Bearer(string token) => new("Bearer", token);

    private async Task<ApiResponse<T>> Send<T>(HttpMethod method, string url, AuthenticationHeaderValue? auth, object? body = null)
    {
        using var request = new HttpRequestMessage(method, url);
        request.Headers.Authorization = auth;
        if (body is not null)
            request.Content = JsonContent.Create(body, options: _json);

        using var response = await client.SendAsync(request);
        var raw = await response.Content.ReadAsStringAsync();
        var parsed = JsonSerializer.Deserialize<AppResult<T>>(raw, _json)
            ?? throw new InvalidOperationException($"Empty response: {(int)response.StatusCode}");

        return new ApiResponse<T>(response.StatusCode, parsed, raw);
    }
}

public sealed record AdminToken(string Token, DateTimeOffset ExpiresAt, string Login);
