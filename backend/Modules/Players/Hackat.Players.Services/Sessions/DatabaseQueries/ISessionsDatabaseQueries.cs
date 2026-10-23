using Hackat.Players.Database.Entities;

namespace Hackat.Players.Services.Sessions.DatabaseQueries;

internal interface ISessionsDatabaseQueries
{
    Task Add(PlayerSession session);

    /// <summary>Действующая (не истёкшая) сессия по хешу токена вместе с игроком.</summary>
    Task<PlayerSession?> GetActive(string tokenHash, DateTimeOffset now);

    Task Touch(long sessionId, DateTimeOffset now, DateTimeOffset? expiresAt);

    Task Delete(long sessionId);
}
