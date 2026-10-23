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
    /// Игра без регистрации: создаётся гость, в ответе token (сохранить на фронте!).
    /// Прогресс гостя доступен только из этого браузера, пока жив токен.
    /// </summary>
    [HttpPost("enter")]
    [AllowAnonymous]
    public async Task<ActionResult<AppResult<AuthResultModel>>> Enter([FromBody] EnterForm form) =>
        AppResult(await playersService.Enter(form));

    /// <summary>
    /// Регистрация по почте и паролю. С токеном гостя — гость становится аккаунтом вместе с прогрессом,
    /// без токена — создаётся новый игрок (нужен nickname). В ответе новый token (старый перестаёт работать).
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting(AuthRateLimits.PlayerAuth)]
    public async Task<ActionResult<AppResult<AuthResultModel>>> Register([FromBody] RegisterForm form) =>
        AppResult(await playersService.Register(form, CurrentSession));

    /// <summary>
    /// Вход по почте и паролю. С токеном гостя — его прогресс переносится в не начатые профессии аккаунта,
    /// гость удаляется (см. transferredProfessions / discardedProfessions).
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting(AuthRateLimits.PlayerAuth)]
    public async Task<ActionResult<AppResult<LoginResultModel>>> Login([FromBody] LoginForm form) =>
        AppResult(await playersService.Login(form, CurrentSession));

    /// <summary>Выход с этого устройства: токен перестаёт работать. Гостю вернуться к прогрессу будет нельзя.</summary>
    [HttpPost("logout")]
    public async Task<ActionResult<AppResult<bool>>> Logout()
    {
        await playersService.Logout(RequiredSession);
        return AppResult(true);
    }

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
