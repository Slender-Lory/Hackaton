using Hackat.Players.Database.Context;
using Hackat.Players.Database.Entities;
using Hackat.Players.Database.Extensions;
using Microsoft.EntityFrameworkCore;

namespace Hackat.Players.Services.Players.DatabaseQueries;

internal sealed class PlayersDatabaseQueries(PlayersDbContext dc) : IPlayersDatabaseQueries
{
    public Task<Player?> GetById(Guid id, bool trackChanges = false) =>
        dc.Players
            .AsTracking(Tracking(trackChanges))
            .FirstOrDefaultAsync(u => u.Id == id);

    public Task<Player?> GetByNormalizedEmail(string normalizedEmail, bool trackChanges = false) =>
        dc.Players
            .AsTracking(Tracking(trackChanges))
            .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

    public Task<bool> IsEmailTaken(string normalizedEmail) =>
        dc.Players.AnyAsync(u => u.NormalizedEmail == normalizedEmail);

    public async Task<bool> TryAdd(Player player)
    {
        dc.Players.Add(player);
        try
        {
            await dc.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateException e) when (e.IsUniqueViolation())
        {
            dc.Entry(player).State = EntityState.Detached;
            return false;
        }
    }

    public Task SaveChanges() => dc.SaveChangesAsync();

    public Task TouchLastSeen(Guid id, DateTimeOffset now) =>
        dc.Players
            .Where(u => u.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.LastSeenAt, now));

    public Task Delete(Guid id) =>
        dc.Players
            .Where(u => u.Id == id)
            .ExecuteDeleteAsync();

    private static QueryTrackingBehavior Tracking(bool trackChanges) =>
        trackChanges ? QueryTrackingBehavior.TrackAll : QueryTrackingBehavior.NoTracking;
}
