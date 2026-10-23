using System.Security.Claims;
using System.Text.Encodings.Web;
using Api.Common;
using Hackat.Common.Result.ErrorCodes;
using Hackat.Players.Services.Sessions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace Api.Auth;

/// <summary>
/// Схема «Player»: заголовок <c>Authorization: Player &lt;token&gt;</c> (старый префикс «Guest» тоже принимается).
/// Токен — сессия устройства из enter / register / login; работает и для гостя, и для аккаунта.
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
    public const string RegisteredClaim = "registered";

    private static readonly string[] _prefixes = ["Player ", "Guest "];

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        string? header = Request.Headers.Authorization;
        var prefix = header is null
            ? null
            : _prefixes.FirstOrDefault(p => header.StartsWith(p, StringComparison.OrdinalIgnoreCase));
        if (prefix is null)
            return AuthenticateResult.NoResult();

        var token = header![prefix.Length..].Trim();
        if (token.Length == 0)
            return AuthenticateResult.Fail("Empty session token");

        var session = await sessionsService.Authenticate(token);
        if (session is null)
            return AuthenticateResult.Fail("Unknown or expired session token");

        var identity = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, session.PlayerId.ToString()),
                new Claim(SessionIdClaim, session.SessionId.ToString()),
                new Claim(RegisteredClaim, session.IsRegistered ? "true" : "false"),
            ],
            SchemeName);

        return AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName));
    }

    protected override Task HandleChallengeAsync(AuthenticationProperties properties) =>
        AppResultResponses.WriteError(Context, AppErrorCodes.Unauthorized);
}
