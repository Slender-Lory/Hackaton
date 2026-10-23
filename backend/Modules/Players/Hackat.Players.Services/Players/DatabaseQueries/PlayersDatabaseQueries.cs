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

    public async Task<bool> TrySaveChanges()
    {
        try
        {
            await dc.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateException e) when (e.IsUniqueViolation())
        {
            dc.ChangeTracker.Clear();
            return false;
        }
    }

    public Task TouchLastSeen(Guid id, DateTimeOffset now) =>
        dc.Players
            .Where(u => u.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.LastSeenAt, now));

    public Task DeleteSessions(Guid playerId) =>
        dc.PlayerSessions
            .Where(u => u.PlayerId == playerId)
            .ExecuteDeleteAsync();

    public async Task<(string[] Transferred, string[] Discarded)> MergeGuestInto(Guid guestId, Guid accountId)
    {
        await using var transaction = await dc.Database.BeginTransactionAsync();

        var guestCodes = await ProfessionCodes(guestId);
        var accountCodes = await ProfessionCodes(accountId);
        var transferred = guestCodes.Except(accountCodes).ToArray();
        var discarded = guestCodes.Intersect(accountCodes).ToArray();

        await dc.PlayerProgress
            .Where(u => u.PlayerId == guestId && transferred.Contains(u.ProfessionCode))
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.PlayerId, accountId));

        // Каскад в БД удалит сессии гостя и непереносённый прогресс. Аккаунт удалить так нельзя.
        await dc.Players
            .Where(u => u.Id == guestId && u.RegisteredAt == null)
            .ExecuteDeleteAsync();

        await transaction.CommitAsync();
        return (transferred, discarded);
    }

    private Task<string[]> ProfessionCodes(Guid playerId) =>
        dc.PlayerProgress
            .Where(u => u.PlayerId == playerId)
            .Select(u => u.ProfessionCode)
            .ToArrayAsync();

    private static QueryTrackingBehavior Tracking(bool trackChanges) =>
        trackChanges ? QueryTrackingBehavior.TrackAll : QueryTrackingBehavior.NoTracking;
}
