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

    public async Task<string[]> AddMissing(Guid playerId, PlayerProgress[] items)
    {
        if (items.Length == 0)
            return [];

        var existing = await dc.PlayerProgress
            .Where(u => u.PlayerId == playerId)
            .Select(u => u.ProfessionCode)
            .ToArrayAsync();

        var missing = items.Where(u => !existing.Contains(u.ProfessionCode)).ToArray();
        dc.PlayerProgress.AddRange(missing);
        try
        {
            await dc.SaveChangesAsync();
        }
        catch (DbUpdateException e) when (e.IsUniqueViolation())
        {
            // Параллельно успели сохранить с другого устройства — оставляем прогресс аккаунта.
            dc.ChangeTracker.Clear();
            return [];
        }

        return missing.Select(u => u.ProfessionCode).ToArray();
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
