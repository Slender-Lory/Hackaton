using Api.Common;
using Hackat.Common.Result;
using Hackat.Players.Contracts.Players;
using Hackat.Players.Contracts.Progress;
using Hackat.Players.Services.Players;
using Hackat.Players.Services.Progress;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.Players;

[Route("api/v1/players")]
[Authorize]
public sealed class PlayersController(
    IPlayersService playersService,
    IProgressService progressService) : ApiControllerBase
{
    /// <summary>
    /// Вход по никнейму. Новый никнейм — создаётся гость, в ответе guestToken (сохранить на фронте!).
    /// Существующий — нужен заголовок <c>Authorization: Guest &lt;token&gt;</c> его владельца, иначе 409 NicknameTaken.
    /// </summary>
    [HttpPost("enter")]
    [AllowAnonymous]
    public async Task<ActionResult<AppResult<EnterResultModel>>> Enter([FromBody] EnterForm form) =>
        AppResult(await playersService.Enter(form, CurrentPlayerId));

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
