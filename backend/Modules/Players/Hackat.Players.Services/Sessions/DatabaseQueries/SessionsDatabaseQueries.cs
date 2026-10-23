using Hackat.Players.Database.Context;
using Hackat.Players.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hackat.Players.Services.Sessions.DatabaseQueries;

internal sealed class SessionsDatabaseQueries(PlayersDbContext dc) : ISessionsDatabaseQueries
{
    public async Task Add(PlayerSession session)
    {
        dc.PlayerSessions.Add(session);
        await dc.SaveChangesAsync();
    }

    public Task<PlayerSession?> GetActive(string tokenHash, DateTimeOffset now) =>
        dc.PlayerSessions
            .AsNoTracking()
            .Include(u => u.Player)
            .FirstOrDefaultAsync(u => u.TokenHash == tokenHash && (u.ExpiresAt == null || u.ExpiresAt > now));

    public Task Touch(long sessionId, DateTimeOffset now, DateTimeOffset? expiresAt) =>
        dc.PlayerSessions
            .Where(u => u.Id == sessionId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(u => u.LastUsedAt, now)
                .SetProperty(u => u.ExpiresAt, expiresAt));

    public Task Delete(long sessionId) =>
        dc.PlayerSessions
            .Where(u => u.Id == sessionId)
            .ExecuteDeleteAsync();
}
