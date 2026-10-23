using Hackat.Players.Database.Context;
using Hackat.Players.Database.Entities;
using Hackat.Players.Database.Extensions;
using Microsoft.EntityFrameworkCore;

namespace Hackat.Players.Services.Progress.DatabaseQueries;

internal sealed class ProgressDatabaseQueries(PlayersDbContext dc) : IProgressDatabaseQueries
{
    public Task<PlayerProgress[]> GetByPlayer(Guid playerId) =>
        dc.PlayerProgress
            .AsNoTracking()
            .Where(u => u.PlayerId == playerId)
            .ToArrayAsync();

    public Task<PlayerProgress?> Get(Guid playerId, string professionCode, bool trackChanges = false) =>
        dc.PlayerProgress
            .AsTracking(trackChanges ? QueryTrackingBehavior.TrackAll : QueryTrackingBehavior.NoTracking)
            .FirstOrDefaultAsync(u => u.PlayerId == playerId && u.ProfessionCode == professionCode);

    public async Task<bool> TryAdd(PlayerProgress progress)
    {
        dc.PlayerProgress.Add(progress);
        try
        {
            await dc.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateException e) when (e.IsUniqueViolation())
        {
            dc.Entry(progress).State = EntityState.Detached;
            return false;
        }
    }

    public async Task<bool> TrySaveChanges()
    {
        try
        {
            await dc.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            dc.ChangeTracker.Clear();
            return false;
        }
    }
}
