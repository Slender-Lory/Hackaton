namespace Hackat.Players.Services.Sessions;

/// <summary>Сессия, найденная по токену из заголовка Authorization.</summary>
public sealed record SessionInfo(long SessionId, Guid PlayerId);

public interface ISessionsService
{
    /// <summary>Игрок и сессия по токену; null — токен неизвестен или сессия истекла.</summary>
    Task<SessionInfo?> Authenticate(string token);

    /// <summary>Выход с текущего устройства.</summary>
    Task Revoke(long sessionId);
}
