using Hackat.Players.Database.Entities;

namespace Hackat.Players.Services.Progress.DatabaseQueries;

internal interface IProgressDatabaseQueries
{
    Task<PlayerProgress[]> GetByPlayer(Guid playerId);

    Task<PlayerProgress?> Get(Guid playerId, string professionCode, bool trackChanges = false);

    /// <summary>false — запись для этой пары игрок + профессия уже создана параллельным запросом.</summary>
    Task<bool> TryAdd(PlayerProgress progress);

    /// <summary>false — ревизия в БД изменилась после чтения (оптимистичная блокировка).</summary>
    Task<bool> TrySaveChanges();

    /// <summary>
    /// Добавляет записи для профессий, которых у игрока ещё нет; существующие не трогает.
    /// Возвращает коды добавленных профессий.
    /// </summary>
    Task<string[]> AddMissing(Guid playerId, PlayerProgress[] items);
}
