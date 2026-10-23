using Hackat.Players.Contracts.Progress;

namespace Hackat.Players.Contracts.Players;

/// <summary>Игрок. <see cref="Email"/> = null — гость.</summary>
public sealed record PlayerModel(
    Guid Id,
    string Nickname,
    bool IsRegistered,
    string? Email,
    DateTimeOffset CreatedAt);

/// <summary>Профиль: игрок и прогресс по всем профессиям.</summary>
public sealed record PlayerProfileModel(
    PlayerModel Player,
    ProgressModel[] Progress);

/// <summary>
/// Результат входа/регистрации: токен сессии этого устройства.
/// Фронт хранит его (localStorage) и передаёт в заголовке <c>Authorization: Player &lt;token&gt;</c>.
/// Сервер хранит только хеш токена, восстановить его нельзя.
/// </summary>
/// <param name="ExpiresAt">null — сессия гостя, не истекает; у аккаунта продлевается при использовании.</param>
public sealed record AuthResultModel(
    PlayerModel Player,
    string Token,
    DateTimeOffset? ExpiresAt);

/// <summary>
/// Вход по почте из браузера, где играл гость: прогресс гостя переносится в профессии,
/// которые в аккаунте ещё не начаты (<see cref="TransferredProfessions"/>);
/// где начаты оба — остаётся прогресс аккаунта (<see cref="DiscardedProfessions"/>).
/// </summary>
public sealed record LoginResultModel(
    PlayerModel Player,
    string Token,
    DateTimeOffset? ExpiresAt,
    string[] TransferredProfessions,
    string[] DiscardedProfessions);
