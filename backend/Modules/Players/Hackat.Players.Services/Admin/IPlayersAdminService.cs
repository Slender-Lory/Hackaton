using Hackat.Common.Result;
using Hackat.Players.Contracts.Admin;

namespace Hackat.Players.Services.Admin;

/// <summary>Просмотр данных всех игроков. Проверка роли — на уровне API (политика Admin).</summary>
public interface IPlayersAdminService
{
    Task<PagedResult<AdminPlayerListItemModel>> GetPlayers(AdminPlayersFilterForm form);

    Task<AppResult<AdminPlayerDetailsModel>> GetPlayer(Guid playerId);

    Task<AdminStatsModel> GetStats();
}
