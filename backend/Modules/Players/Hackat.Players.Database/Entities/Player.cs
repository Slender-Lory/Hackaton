namespace Hackat.Players.Database.Entities;

/// <summary>
/// Игрок. Сейчас все игроки — гости (вход по никнейму + токен браузера).
/// Регистрация по почте позже добавит сюда Email/PasswordHash, и гость
/// «повысится» до аккаунта без переноса прогресса.
/// </summary>
public class Player
{
    public Guid Id { get; set; }

    /// <summary>Никнейм как его ввёл игрок (для отображения и обращения персонажей).</summary>
    public string Nickname { get; set; } = "";

    /// <summary>Никнейм в нижнем регистре без лишних пробелов — уникальный ключ поиска.</summary>
    public string NormalizedNickname { get; set; } = "";

    /// <summary>SHA-256 гостевого токена (hex). Сам токен знает только браузер игрока.</summary>
    public string GuestTokenHash { get; set; } = "";

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset LastSeenAt { get; set; }

    public List<PlayerProgress> Progress { get; set; } = [];
}
