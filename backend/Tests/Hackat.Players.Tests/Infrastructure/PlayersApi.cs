using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Hackat.Common.Result;
using Hackat.Players.Contracts.Players;
using Hackat.Players.Contracts.Progress;

namespace Hackat.Players.Tests.Infrastructure;

/// <summary>Обёртка над HTTP API игроков (аналог Accessor из эталонного проекта).</summary>
public sealed class PlayersApi(HttpClient client)
{
    public const string DefaultPassword = "correct-horse-42";

    private static readonly JsonSerializerOptions _json = JsonSerializerOptions.Web;

    public Task<ApiResponse<AuthResultModel>> Enter(string nickname) =>
        Send<AuthResultModel>(HttpMethod.Post, "/api/v1/players/enter", null, new { nickname });

    public Task<ApiResponse<AuthResultModel>> Register(string? token, string email, string password = DefaultPassword, string? nickname = null) =>
        Send<AuthResultModel>(HttpMethod.Post, "/api/v1/players/register", token, new { email, password, nickname });

    public Task<ApiResponse<LoginResultModel>> Login(string? token, string email, string password = DefaultPassword) =>
        Send<LoginResultModel>(HttpMethod.Post, "/api/v1/players/login", token, new { email, password });

    public Task<ApiResponse<bool>> Logout(string token) =>
        Send<bool>(HttpMethod.Post, "/api/v1/players/logout", token);

    public Task<ApiResponse<PlayerProfileModel>> Me(string? token) =>
        Send<PlayerProfileModel>(HttpMethod.Get, "/api/v1/players/me", token);

    public Task<ApiResponse<ProgressModel>> GetProgress(string token, string professionCode) =>
        Send<ProgressModel>(HttpMethod.Get, $"/api/v1/players/me/progress/{professionCode}", token);

    public Task<ApiResponse<ProgressModel>> SaveProgress(string token, string professionCode, object form) =>
        Send<ProgressModel>(HttpMethod.Put, $"/api/v1/players/me/progress/{professionCode}", token, form);

    /// <summary>Создаёт гостя с уникальным никнеймом и возвращает его токен.</summary>
    public async Task<(AuthResultModel Player, string Token)> NewGuest()
    {
        var response = await Enter(UniqueNickname());
        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        var result = response.Body.Result!;
        return (result, result.Token);
    }

    /// <summary>Регистрирует нового игрока (без гостя) и возвращает почту и токен.</summary>
    public async Task<(AuthResultModel Player, string Email, string Token)> NewAccount()
    {
        var email = UniqueEmail();
        var response = await Register(token: null, email, nickname: UniqueNickname());
        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        var result = response.Body.Result!;
        return (result, email, result.Token);
    }

    public static string UniqueNickname() => "t" + Guid.NewGuid().ToString("N")[..12];

    public static string UniqueEmail() => $"player-{Guid.NewGuid():N}@example.com";

    private async Task<ApiResponse<T>> Send<T>(HttpMethod method, string url, string? token, object? body = null)
    {
        using var request = new HttpRequestMessage(method, url);
        if (token is not null)
            request.Headers.Authorization = new AuthenticationHeaderValue("Player", token);
        if (body is not null)
            request.Content = JsonContent.Create(body, options: _json);

        using var response = await client.SendAsync(request);
        var raw = await response.Content.ReadAsStringAsync();
        var parsed = JsonSerializer.Deserialize<AppResult<T>>(raw, _json)
            ?? throw new InvalidOperationException($"Empty response: {(int)response.StatusCode}");

        return new ApiResponse<T>(response.StatusCode, parsed, raw);
    }
}

public sealed record ApiResponse<T>(HttpStatusCode Status, AppResult<T> Body, string Raw);
