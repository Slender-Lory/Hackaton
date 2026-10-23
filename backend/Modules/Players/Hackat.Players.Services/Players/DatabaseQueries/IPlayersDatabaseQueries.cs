using Hackat.Players.Database.Entities;

namespace Hackat.Players.Services.Players.DatabaseQueries;

internal interface IPlayersDatabaseQueries
{
    Task<Player?> GetById(Guid id, bool trackChanges = false);

    Task<Player?> GetByNormalizedEmail(string normalizedEmail, bool trackChanges = false);

    Task<bool> IsEmailTaken(string normalizedEmail);

    /// <summary>Добавляет игрока. false — почта уже занята (уникальный индекс, гонка регистраций).</summary>
    Task<bool> TryAdd(Player player);

    /// <summary>Сохраняет изменения отслеживаемого игрока. false — почта уже занята.</summary>
    Task<bool> TrySaveChanges();

    Task TouchLastSeen(Guid id, DateTimeOffset now);

    Task DeleteSessions(Guid playerId);

    /// <summary>
    /// Переносит прогресс гостя в аккаунт и удаляет гостя (вместе с его сессиями и остатком прогресса).
    /// Переносятся только профессии, не начатые в аккаунте.
    /// </summary>
    Task<(string[] Transferred, string[] Discarded)> MergeGuestInto(Guid guestId, Guid accountId);
}
