using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace Hackat.Players.Contracts.Progress;

/// <summary>
/// Сохранение прогресса. Уровень и процент считает фронт (он знает игровой контент),
/// <see cref="State"/> — произвольный JSON игры (текущий день, сцена, флаги диалогов и т.п.).
/// </summary>
public sealed class SaveProgressForm
{
    public const int MaxStateBytes = 32 * 1024;

    [Range(0, 1000, ErrorMessage = "Уровень должен быть от 0 до 1000")]
    public int Level { get; init; }

    [Range(0, 100, ErrorMessage = "Процент прохождения должен быть от 0 до 100")]
    public int Percent { get; init; }

    [EnumDataType(typeof(Difficulty), ErrorMessage = "Неизвестный уровень сложности")]
    public Difficulty Difficulty { get; init; } = Difficulty.Normal;

    public JsonElement? State { get; init; }

    /// <summary>
    /// Ревизия, которую видел клиент (0 — прогресса ещё нет).
    /// Если на сервере уже другая ревизия, сохранение отклоняется с ProgressConflict.
    /// </summary>
    [Range(0, int.MaxValue, ErrorMessage = "Некорректная ревизия")]
    public int ExpectedRevision { get; init; }
}
