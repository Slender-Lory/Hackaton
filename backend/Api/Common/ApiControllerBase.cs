using System.Security.Claims;
using Api.Auth;
using Hackat.Common.Result;
using Hackat.Common.Result.ErrorCodes;
using Hackat.Players.Services.Sessions;
using Microsoft.AspNetCore.Mvc;

namespace Api.Common;

/// <summary>
/// База для контроллеров: единый формат ответа <c>{ result, error: { code, message } }</c>
/// и HTTP-статус из кода ошибки (<see cref="HttpStatusAttribute"/>).
/// </summary>
[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    /// <summary>Сессия игрока из заголовка Authorization (null — запрос без входа).</summary>
    protected SessionInfo? CurrentSession =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var playerId)
        && long.TryParse(User.FindFirstValue(PlayerAuthenticationHandler.SessionIdClaim), out var sessionId)
            ? new SessionInfo(sessionId, playerId)
            : null;

    /// <summary>Сессия для действий под [Authorize] — там она гарантированно есть.</summary>
    protected SessionInfo RequiredSession =>
        CurrentSession ?? throw new InvalidOperationException("Action requires an authenticated player");

    protected Guid RequiredPlayerId => RequiredSession.PlayerId;

    protected ActionResult<AppResult<T>> AppResult<T>(AppResult<T> result) =>
        result.IsCorrect
            ? Ok(result)
            : StatusCode(result.Error.Code.ToHttpStatus(), result);

    protected ActionResult<AppResult<T>> AppResult<T>(T result) => Ok(new AppResult<T>(result));
}
