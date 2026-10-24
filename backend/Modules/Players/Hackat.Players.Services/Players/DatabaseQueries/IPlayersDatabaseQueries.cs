using Hackat.Players.Database.Entities;

namespace Hackat.Players.Services.Players.DatabaseQueries;

internal interface IPlayersDatabaseQueries
{
    Task<Player?> GetById(Guid id, bool trackChanges = false);

    Task<Player?> GetByNormalizedEmail(string normalizedEmail, bool trackChanges = false);

    Task<bool> IsEmailTaken(string normalizedEmail);

    /// <summary>Добавляет игрока. false — почта уже занята (уникальный индекс, гонка регистраций).</summary>
    Task<bool> TryAdd(Player player);

    Task SaveChanges();

    Task TouchLastSeen(Guid id, DateTimeOffset now);

    /// <summary>Удаляет игрока; сессии и прогресс удаляются каскадом в БД.</summary>
    Task Delete(Guid id);
}
