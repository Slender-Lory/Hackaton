using Hackat.Players.Database.Context;
using Hackat.Players.Database.Entities;
using Hackat.Players.Database.Extensions;
using Microsoft.EntityFrameworkCore;

namespace Hackat.Players.Services.Players.DatabaseQueries;

internal sealed class PlayersDatabaseQueries(PlayersDbContext dc) : IPlayersDatabaseQueries
{
    public Task<Player?> GetById(Guid id, bool trackChanges = false) =>
        dc.Players
            .AsTracking(trackChanges ? QueryTrackingBehavior.TrackAll : QueryTrackingBehavior.NoTracking)
            .FirstOrDefaultAsync(u => u.Id == id);

    public Task<Player?> GetByNormalizedNickname(string normalizedNickname) =>
        dc.Players
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.NormalizedNickname == normalizedNickname);

    public Task<Guid?> GetIdByGuestTokenHash(string guestTokenHash) =>
        dc.Players
            .AsNoTracking()
            .Where(u => u.GuestTokenHash == guestTokenHash)
            .Select(u => (Guid?)u.Id)
            .FirstOrDefaultAsync();

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

    public Task TouchLastSeen(Guid id, DateTimeOffset now) =>
        dc.Players
            .Where(u => u.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.LastSeenAt, now));
}
