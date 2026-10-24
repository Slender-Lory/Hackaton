using System.Security.Claims;
using System.Text.Encodings.Web;
using Api.Common;
using Hackat.Common.Result.ErrorCodes;
using Hackat.Players.Services.Sessions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace Api.Auth;

/// <summary>
/// Схема «Player»: заголовок <c>Authorization: Player &lt;token&gt;</c>.
/// Токен — сессия устройства из register / login (гости на сервер не ходят).
/// </summary>
public sealed class PlayerAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    ISessionsService sessionsService)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "Player";
    public const string SessionIdClaim = "sid";

    private const string Prefix = SchemeName + " ";

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        string? header = Request.Headers.Authorization;
        if (header is null || !header.StartsWith(Prefix, StringComparison.OrdinalIgnoreCase))
            return AuthenticateResult.NoResult();

        var token = header[Prefix.Length..].Trim();
        if (token.Length == 0)
            return AuthenticateResult.Fail("Empty session token");

        var session = await sessionsService.Authenticate(token);
        if (session is null)
            return AuthenticateResult.Fail("Unknown or expired session token");

        var identity = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, session.PlayerId.ToString()),
                new Claim(SessionIdClaim, session.SessionId.ToString()),
            ],
            SchemeName);

        return AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName));
    }

    protected override Task HandleChallengeAsync(AuthenticationProperties properties) =>
        AppResultResponses.WriteError(Context, AppErrorCodes.Unauthorized);
}
