using Hackat.Common.Result;
using Hackat.Common.Result.ErrorCodes;
using Hackat.Players.Contracts.Admin;
using Hackat.Players.Contracts.Professions;
using Hackat.Players.Services.Admin.DatabaseQueries;
using Hackat.Players.Services.Mapping;
using Hackat.Players.Services.Players;
using Hackat.Players.Services.Players.DatabaseQueries;
using Hackat.Players.Services.Progress;

namespace Hackat.Players.Services.Admin;

internal sealed class PlayersAdminService(
    IPlayersAdminDatabaseQueries adminQueries,
    IPlayersDatabaseQueries playersQueries,
    IProgressService progressService,
    TimeProvider timeProvider) : IPlayersAdminService
{
    public async Task<PagedResult<AdminPlayerListItemModel>> GetPlayers(AdminPlayersFilterForm form)
    {
        var filter = string.IsNullOrWhiteSpace(form.Search)
            ? PlayersSearch.Everyone
            : new PlayersSearch(
                NicknameNormalizer.ToKey(NicknameNormalizer.ToDisplay(form.Search)),
                form.Search.Trim().ToLowerInvariant());

        var players = await adminQueries.Search(filter, form.Offset, form.Count);
        var total = await adminQueries.Count(filter);

        return new PagedResult<AdminPlayerListItemModel>(
            players.Select(u => u.ToAdminListItem()).ToArray(),
            total,
            form.Offset,
            form.Count);
    }

    public async Task<AppResult<AdminPlayerDetailsModel>> GetPlayer(Guid playerId)
    {
        var player = await playersQueries.GetById(playerId);
        if (player is null)
            return AppErrorCodes.PlayerNotFound;

        var progress = await progressService.GetAll(playerId);
        return new AdminPlayerDetailsModel(
            player.Id,
            player.Nickname,
            player.Email,
            player.CreatedAt,
            player.LastSeenAt,
            progress);
    }

    public async Task<AdminStatsModel> GetStats()
    {
        var dayAgo = timeProvider.GetUtcNow().AddDays(-1);
        var aggregates = (await adminQueries.AggregateProgress())
            .ToDictionary(u => u.ProfessionCode, StringComparer.Ordinal);

        var professions = ProfessionCatalog.Titles
            .Select(p => aggregates.TryGetValue(p.Key, out var a)
                ? new ProfessionStatsModel(p.Key, p.Value, a.Started, a.Completed, Math.Round(a.AveragePercent, 1))
                : new ProfessionStatsModel(p.Key, p.Value, 0, 0, 0))
            .ToArray();

        return new AdminStatsModel(
            await adminQueries.Count(PlayersSearch.Everyone),
            await adminQueries.CountCreatedSince(dayAgo),
            await adminQueries.CountSeenSince(dayAgo),
            professions);
    }
}
