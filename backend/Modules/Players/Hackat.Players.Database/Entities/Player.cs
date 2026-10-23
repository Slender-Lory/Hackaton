namespace Hackat.Players.Database.Entities;

/// <summary>
/// Игрок. Гость — только никнейм, играет из одного браузера (по сессии).
/// Зарегистрированный — у той же записи заполнены Email/PasswordHash, вход с любого устройства.
/// </summary>
public class Player
{
    public Guid Id { get; set; }

    /// <summary>Никнейм — как к игроку обращаются персонажи. Не уникален.</summary>
    public string Nickname { get; set; } = "";

    /// <summary>Никнейм в нижнем регистре без лишних пробелов — для поиска в админке.</summary>
    public string NormalizedNickname { get; set; } = "";

    /// <summary>Почта как её ввёл игрок; null — гость.</summary>
    public string? Email { get; set; }

    /// <summary>Почта в нижнем регистре — уникальный ключ входа.</summary>
    public string? NormalizedEmail { get; set; }

    /// <summary>Хеш пароля (ASP.NET Core Identity PasswordHasher, PBKDF2).</summary>
    public string? PasswordHash { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? RegisteredAt { get; set; }

    public DateTimeOffset LastSeenAt { get; set; }

    public bool IsRegistered => RegisteredAt is not null;

    public List<PlayerProgress> Progress { get; set; } = [];

    public List<PlayerSession> Sessions { get; set; } = [];
}
