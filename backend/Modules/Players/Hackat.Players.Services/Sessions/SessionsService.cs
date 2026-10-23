using Hackat.Players.Database.Entities;
using Hackat.Players.Services.Sessions.DatabaseQueries;

namespace Hackat.Players.Services.Sessions;

internal sealed class SessionsService(
    ISessionsDatabaseQueries databaseQueries,
    TimeProvider timeProvider) : ISessionsService
{
    /// <summary>Сессия аккаунта живёт 30 дней с последнего использования.</summary>
    public static readonly TimeSpan AccountSessionLifetime = TimeSpan.FromDays(30);

    /// <summary>Чтобы не писать в БД на каждый запрос, «последнее использование» обновляем не чаще раза в час.</summary>
    private static readonly TimeSpan _touchInterval = TimeSpan.FromHours(1);

    public async Task<SessionInfo?> Authenticate(string token)
    {
        var now = timeProvider.GetUtcNow();
        var session = await databaseQueries.GetActive(SessionTokens.Hash(token), now);
        if (session is null)
            return null;

        if (now - session.LastUsedAt > _touchInterval)
            await databaseQueries.Touch(session.Id, now, ExpiresAt(session.Player.IsRegistered, now));

        return new SessionInfo(session.Id, session.PlayerId, session.Player.IsRegistered);
    }

    public Task Revoke(long sessionId) => databaseQueries.Delete(sessionId);

    /// <summary>Создаёт сессию для игрока и возвращает токен (показывается клиенту один раз).</summary>
    internal async Task<(string Token, DateTimeOffset? ExpiresAt)> Create(Player player)
    {
        var now = timeProvider.GetUtcNow();
        var (token, hash) = SessionTokens.Generate();
        var expiresAt = ExpiresAt(player.IsRegistered, now);

        await databaseQueries.Add(new PlayerSession
        {
            PlayerId = player.Id,
            TokenHash = hash,
            CreatedAt = now,
            LastUsedAt = now,
            ExpiresAt = expiresAt,
        });

        return (token, expiresAt);
    }

    private static DateTimeOffset? ExpiresAt(bool isRegistered, DateTimeOffset now) =>
        isRegistered ? now + AccountSessionLifetime : null;
}
