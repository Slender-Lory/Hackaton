using Hackat.Players.Database.Entities;

namespace Hackat.Players.Services.Players.DatabaseQueries;

internal interface IPlayersDatabaseQueries
{
    Task<Player?> GetById(Guid id, bool trackChanges = false);

    Task<Player?> GetByNormalizedNickname(string normalizedNickname);

    Task<Guid?> GetIdByGuestTokenHash(string guestTokenHash);

    /// <summary>Добавляет игрока. false — никнейм или токен уже заняты (уникальный индекс).</summary>
    Task<bool> TryAdd(Player player);

    Task TouchLastSeen(Guid id, DateTimeOffset now);
}
