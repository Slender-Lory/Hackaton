using Hackat.Players.Contracts.Admin;
using Hackat.Players.Database.Context;
using Hackat.Players.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hackat.Players.Services.Admin.DatabaseQueries;

internal sealed class PlayersAdminDatabaseQueries(PlayersDbContext dc) : IPlayersAdminDatabaseQueries
{
    public Task<Player[]> Search(PlayersSearch search, int offset, int count) =>
        BaseQuery(search)
            .OrderByDescending(u => u.LastSeenAt)
            .ThenBy(u => u.Id)
            .Skip(offset)
            .Take(count)
            .Include(u => u.Progress)
            .ToArrayAsync();

    public Task<int> Count(PlayersSearch search) =>
        BaseQuery(search).CountAsync();

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

    private IQueryable<Player> BaseQuery(PlayersSearch search)
    {
        var query = dc.Players.AsNoTracking();

        query = search.Kind switch
        {
            PlayerKind.Guests => query.Where(u => u.RegisteredAt == null),
            PlayerKind.Registered => query.Where(u => u.RegisteredAt != null),
            _ => query,
        };

        if (search.NicknameKey is { } nickname && search.EmailPart is { } email)
        {
            query = query.Where(u =>
                u.NormalizedNickname.Contains(nickname)
                || (u.NormalizedEmail != null && u.NormalizedEmail.Contains(email)));
        }

        return query;
    }
}
