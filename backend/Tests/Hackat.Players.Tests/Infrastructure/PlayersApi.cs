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
    private static readonly JsonSerializerOptions _json = JsonSerializerOptions.Web;

    public Task<ApiResponse<EnterResultModel>> Enter(string nickname, string? token = null) =>
        Send<EnterResultModel>(HttpMethod.Post, "/api/v1/players/enter", token, new { nickname });

    public Task<ApiResponse<PlayerProfileModel>> Me(string? token) =>
        Send<PlayerProfileModel>(HttpMethod.Get, "/api/v1/players/me", token);

    public Task<ApiResponse<ProgressModel>> GetProgress(string token, string professionCode) =>
        Send<ProgressModel>(HttpMethod.Get, $"/api/v1/players/me/progress/{professionCode}", token);

    public Task<ApiResponse<ProgressModel>> SaveProgress(string token, string professionCode, object form) =>
        Send<ProgressModel>(HttpMethod.Put, $"/api/v1/players/me/progress/{professionCode}", token, form);

    /// <summary>Создаёт нового гостя с уникальным никнеймом и возвращает его токен.</summary>
    public async Task<(EnterResultModel Player, string Token)> NewGuest()
    {
        var response = await Enter(UniqueNickname());
        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        var result = response.Body.Result!;
        return (result, result.GuestToken!);
    }

    public static string UniqueNickname() => "t" + Guid.NewGuid().ToString("N")[..12];

    private async Task<ApiResponse<T>> Send<T>(HttpMethod method, string url, string? token, object? body = null)
    {
        using var request = new HttpRequestMessage(method, url);
        if (token is not null)
            request.Headers.Authorization = new AuthenticationHeaderValue("Guest", token);
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
