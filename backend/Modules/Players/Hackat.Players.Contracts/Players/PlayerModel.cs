using Hackat.Players.Contracts.Progress;

namespace Hackat.Players.Contracts.Players;

public sealed record PlayerModel(
    Guid Id,
    string Nickname,
    DateTimeOffset CreatedAt);

/// <summary>Профиль: игрок и прогресс по всем профессиям.</summary>
public sealed record PlayerProfileModel(
    PlayerModel Player,
    ProgressModel[] Progress);

/// <summary>
/// Результат входа. <see cref="GuestToken"/> заполнен только при создании нового игрока —
/// фронт сохраняет его (localStorage) и передаёт в заголовке <c>Authorization: Guest &lt;token&gt;</c>.
/// Сервер хранит только хеш токена, восстановить его нельзя.
/// </summary>
public sealed record EnterResultModel(
    PlayerModel Player,
    bool IsNew,
    string? GuestToken);
