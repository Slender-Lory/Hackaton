namespace Hackat.Players.Database.Entities;

/// <summary>
/// Сессия на одном устройстве: токен знает только браузер, в БД — его SHA-256.
/// У гостя сессия бессрочная (другого способа вернуться нет), у аккаунта — скользящие 30 дней.
/// </summary>
public class PlayerSession
{
    public long Id { get; set; }

    public Guid PlayerId { get; set; }

    public Player Player { get; set; } = null!;

    public string TokenHash { get; set; } = "";

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset LastUsedAt { get; set; }

    /// <summary>null — не истекает (гость).</summary>
    public DateTimeOffset? ExpiresAt { get; set; }
}
