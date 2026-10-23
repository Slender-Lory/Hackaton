using Hackat.Players.Database.Context;
using Hackat.Players.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hackat.Players.Services.Admin.DatabaseQueries;

internal sealed class PlayersAdminDatabaseQueries(PlayersDbContext dc) : IPlayersAdminDatabaseQueries
{
    public Task<Player[]> Search(string? normalizedSearch, int offset, int count) =>
        BaseQuery(normalizedSearch)
            .OrderByDescending(u => u.LastSeenAt)
            .ThenBy(u => u.Id)
            .Skip(offset)
            .Take(count)
            .Include(u => u.Progress)
            .ToArrayAsync();

    public Task<int> Count(string? normalizedSearch) =>
        BaseQuery(normalizedSearch).CountAsync();

    public Task<int> CountCreatedSince(DateTimeOffset since) =>
        dc.Players.CountAsync(u => u.CreatedAt >= since);

    public Task<int> CountSeenSince(DateTimeOffset since) =>
        dc.Players.CountAsync(u => u.LastSeenAt >= since);

    public Task<ProfessionAggregate[]> AggregateProgress() =>
        dc.PlayerProgress
            .GroupBy(u => u.ProfessionCode)
            .Select(g => new ProfessionAggregate(
                g.Key,
                g.Count(),
                g.Count(u => u.Percent >= 100),
                g.Average(u => (double)u.Percent)))
            .ToArrayAsync();

    private IQueryable<Player> BaseQuery(string? normalizedSearch)
    {
        var query = dc.Players.AsNoTracking();
        return string.IsNullOrEmpty(normalizedSearch)
            ? query
            : query.Where(u => u.NormalizedNickname.Contains(normalizedSearch));
    }
}
