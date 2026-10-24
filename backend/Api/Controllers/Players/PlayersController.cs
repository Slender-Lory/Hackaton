using Api.Common;
using Hackat.Common.Result;
using Hackat.Players.Contracts.Players;
using Hackat.Players.Contracts.Progress;
using Hackat.Players.Services.Players;
using Hackat.Players.Services.Progress;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Api.Controllers.Players;

[Route("api/v1/players")]
[Authorize]
public sealed class PlayersController(
    IPlayersService playersService,
    IProgressService progressService) : ApiControllerBase
{
    /// <summary>
    /// Регистрация по почте и паролю. Гость передаёт свой прогресс из localStorage в progress —
    /// аккаунт создаётся сразу с ним. В ответе token сессии этого устройства.
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting(AuthRateLimits.PlayerAuth)]
    public async Task<ActionResult<AppResult<AuthResultModel>>> Register([FromBody] RegisterForm form) =>
        AppResult(await playersService.Register(form));

    /// <summary>
    /// Вход по почте и паролю. Прогресс гостя из localStorage (progress) переносится в профессии,
    /// не начатые в аккаунте (importedProfessions); где начаты — остаётся прогресс аккаунта (skippedProfessions).
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting(AuthRateLimits.PlayerAuth)]
    public async Task<ActionResult<AppResult<AuthResultModel>>> Login([FromBody] LoginForm form) =>
        AppResult(await playersService.Login(form));

    /// <summary>Выход с этого устройства: токен перестаёт работать, другие устройства не затрагиваются.</summary>
    [HttpPost("logout")]
    public async Task<ActionResult<AppResult<bool>>> Logout()
    {
        await playersService.Logout(RequiredSession);
        return AppResult(true);
    }

    /// <summary>Удаление аккаунта вместе с прогрессом и сессиями на всех устройствах. Нужен пароль.</summary>
    [HttpDelete("me")]
    [EnableRateLimiting(AuthRateLimits.PlayerAuth)]
    public async Task<ActionResult<AppResult<bool>>> DeleteAccount([FromBody] DeleteAccountForm form) =>
        AppResult(await playersService.DeleteAccount(RequiredPlayerId, form));

    /// <summary>Профиль текущего игрока с прогрессом по всем профессиям.</summary>
    [HttpGet("me")]
    public async Task<ActionResult<AppResult<PlayerProfileModel>>> Me() =>
        AppResult(await playersService.GetProfile(RequiredPlayerId));

    [HttpGet("me/progress")]
    public async Task<ActionResult<AppResult<ProgressModel[]>>> GetAllProgress() =>
        AppResult(await progressService.GetAll(RequiredPlayerId));

    /// <summary>Прогресс по профессии. Если профессия не начата — revision = 0.</summary>
    [HttpGet("me/progress/{professionCode}")]
    public async Task<ActionResult<AppResult<ProgressModel>>> GetProgress(string professionCode) =>
        AppResult(await progressService.Get(RequiredPlayerId, professionCode));

    /// <summary>
    /// Сохранение прогресса. expectedRevision — ревизия из последнего ответа сервера (0 для первого сохранения).
    /// Если прогресс успели сохранить из другой вкладки — 409 ProgressConflict, нужно перечитать.
    /// </summary>
    [HttpPut("me/progress/{professionCode}")]
    public async Task<ActionResult<AppResult<ProgressModel>>> SaveProgress(
        string professionCode,
        [FromBody] SaveProgressForm form) =>
        AppResult(await progressService.Save(RequiredPlayerId, professionCode, form));
}
