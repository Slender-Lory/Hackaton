using System.Security.Claims;
using System.Text.Encodings.Web;
using Api.Common;
using Hackat.Common.Result.ErrorCodes;
using Hackat.Players.Services.Players;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace Api.Auth;

/// <summary>
/// Схема «Guest»: заголовок <c>Authorization: Guest &lt;token&gt;</c>.
/// Токен выдаётся при создании игрока (POST /api/v1/players/enter) и хранится на фронте.
/// Регистрация по почте позже добавит вторую схему рядом с этой.
/// </summary>
public sealed class GuestAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IPlayersService playersService)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "Guest";
    private const string Prefix = SchemeName + " ";

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        string? header = Request.Headers.Authorization;
        if (header is null || !header.StartsWith(Prefix, StringComparison.OrdinalIgnoreCase))
            return AuthenticateResult.NoResult();

        var token = header[Prefix.Length..].Trim();
        if (token.Length == 0)
            return AuthenticateResult.Fail("Empty guest token");

        var playerId = await playersService.GetIdByGuestToken(token);
        if (playerId is null)
            return AuthenticateResult.Fail("Unknown guest token");

        var identity = new ClaimsIdentity(
            [new Claim(ClaimTypes.NameIdentifier, playerId.Value.ToString())],
            SchemeName);

        return AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName));
    }

    protected override Task HandleChallengeAsync(AuthenticationProperties properties) =>
        AppResultResponses.WriteError(Context, AppErrorCodes.Unauthorized);
}
