using Hackat.Players.Contracts.Progress;

namespace Hackat.Players.Database.Entities;

/// <summary>
/// Прогресс игрока по одной профессии (одна строка на пару игрок + профессия).
/// Level/Percent — для профиля, State — снимок игры для продолжения (jsonb).
/// </summary>
public class PlayerProgress
{
    public long Id { get; set; }

    public Guid PlayerId { get; set; }

    public Player Player { get; set; } = null!;

    public string ProfessionCode { get; set; } = "";

    public int Level { get; set; }

    public int Percent { get; set; }

    public Difficulty Difficulty { get; set; }

    /// <summary>JSON-снимок состояния игры (jsonb), формат определяет фронт.</summary>
    public string? State { get; set; }

    /// <summary>Увеличивается при каждом сохранении; токен оптимистичной блокировки.</summary>
    public int Revision { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
