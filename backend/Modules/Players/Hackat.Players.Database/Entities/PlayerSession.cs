namespace Hackat.Players.Database.Entities;

/// <summary>
/// Сессия на одном устройстве: токен знает только браузер, в БД — его SHA-256.
/// Живёт 30 дней с последнего использования; «Выйти» удаляет только сессию этого устройства.
/// </summary>
public class PlayerSession
{
    public long Id { get; set; }

    public Guid PlayerId { get; set; }

    public Player Player { get; set; } = null!;

    public string TokenHash { get; set; } = "";

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset LastUsedAt { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }
}
