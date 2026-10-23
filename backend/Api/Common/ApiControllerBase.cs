using System.Security.Claims;
using Hackat.Common.Result;
using Hackat.Common.Result.ErrorCodes;
using Microsoft.AspNetCore.Mvc;

namespace Api.Common;

/// <summary>
/// База для контроллеров: единый формат ответа <c>{ result, error: { code, message } }</c>
/// и HTTP-статус из кода ошибки (<see cref="HttpStatusAttribute"/>).
/// </summary>
[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    /// <summary>Id игрока из гостевого токена (null — запрос без входа).</summary>
    protected Guid? CurrentPlayerId =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    /// <summary>Id игрока для действий под [Authorize] — там он гарантированно есть.</summary>
    protected Guid RequiredPlayerId =>
        CurrentPlayerId ?? throw new InvalidOperationException("Action requires an authenticated player");

    protected ActionResult<AppResult<T>> AppResult<T>(AppResult<T> result) =>
        result.IsCorrect
            ? Ok(result)
            : StatusCode(result.Error.Code.ToHttpStatus(), result);

    protected ActionResult<AppResult<T>> AppResult<T>(T result) => Ok(new AppResult<T>(result));
}
