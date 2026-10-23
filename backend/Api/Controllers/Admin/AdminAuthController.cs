using Api.Auth.Admin;
using Api.Common;
using Hackat.Common.Result;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Api.Controllers.Admin;

[Route("api/v1/admin")]
public sealed class AdminAuthController(AdminAuthService adminAuthService) : ApiControllerBase
{
    /// <summary>Вход администратора. Токен передавать в заголовке <c>Authorization: Bearer &lt;token&gt;</c>.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting(AdminAuthExtensions.LoginRateLimitPolicy)]
    public ActionResult<AppResult<AdminTokenModel>> Login([FromBody] AdminLoginForm form) =>
        AppResult(adminAuthService.Login(form));

    /// <summary>Проверка токена администратора.</summary>
    [HttpGet("me")]
    [Authorize(Policy = AdminAuthOptions.PolicyName)]
    public ActionResult<AppResult<string>> Me() =>
        AppResult(User.Identity?.Name ?? "");
}
