using Hackat.Players.Contracts.Progress;

namespace Hackat.Players.Contracts.Players;

/// <summary>Аккаунт игрока. Гости на сервере не хранятся.</summary>
public sealed record PlayerModel(
    Guid Id,
    string Nickname,
    string Email,
    DateTimeOffset CreatedAt);

/// <summary>Профиль: игрок и прогресс по всем профессиям.</summary>
public sealed record PlayerProfileModel(
    PlayerModel Player,
    ProgressModel[] Progress);

/// <summary>
/// Результат регистрации/входа: токен сессии этого устройства.
/// Фронт хранит его (localStorage) и передаёт в заголовке <c>Authorization: Player &lt;token&gt;</c>.
/// Сервер хранит только хеш токена. Сессия живёт 30 дней с последнего использования.
/// </summary>
/// <param name="ImportedProfessions">Профессии, прогресс которых перенесён из браузера (localStorage).</param>
/// <param name="SkippedProfessions">Профессии из браузера, которые в аккаунте уже были начаты — там остался прогресс аккаунта.</param>
public sealed record AuthResultModel(
    PlayerModel Player,
    string Token,
    DateTimeOffset ExpiresAt,
    string[] ImportedProfessions,
    string[] SkippedProfessions);
