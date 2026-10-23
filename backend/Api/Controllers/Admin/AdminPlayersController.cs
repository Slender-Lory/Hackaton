using Api.Auth.Admin;
using Api.Common;
using Hackat.Common.Result;
using Hackat.Players.Contracts.Admin;
using Hackat.Players.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.Admin;

[Route("api/v1/admin")]
[Authorize(Policy = AdminAuthOptions.PolicyName)]
public sealed class AdminPlayersController(IPlayersAdminService adminService) : ApiControllerBase
{
    /// <summary>Список игроков с кратким прогрессом. Поиск по части никнейма, сначала недавно активные.</summary>
    [HttpGet("players")]
    public async Task<ActionResult<AppResult<PagedResult<AdminPlayerListItemModel>>>> GetPlayers(
        [FromQuery] AdminPlayersFilterForm form) =>
        AppResult(await adminService.GetPlayers(form));

    /// <summary>Карточка игрока: прогресс по всем профессиям вместе с State.</summary>
    [HttpGet("players/{playerId:guid}")]
    public async Task<ActionResult<AppResult<AdminPlayerDetailsModel>>> GetPlayer(Guid playerId) =>
        AppResult(await adminService.GetPlayer(playerId));

    /// <summary>Сводка: сколько игроков, новых и активных за сутки, прогресс по профессиям.</summary>
    [HttpGet("stats")]
    public async Task<ActionResult<AppResult<AdminStatsModel>>> GetStats() =>
        AppResult(await adminService.GetStats());
}
