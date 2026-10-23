using System.Text.Json;

namespace Hackat.Players.Contracts.Progress;

/// <summary>
/// Прогресс игрока по одной профессии.
/// <see cref="Revision"/> = 0 означает, что игрок профессию ещё не начинал.
/// </summary>
public sealed record ProgressModel(
    string ProfessionCode,
    string ProfessionTitle,
    int Level,
    int Percent,
    Difficulty Difficulty,
    JsonElement? State,
    int Revision,
    DateTimeOffset? UpdatedAt);
