using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace Hackat.Players.Contracts.Progress;

/// <summary>Прогресс гостя по одной профессии из localStorage — переносится в аккаунт при регистрации/входе.</summary>
public sealed class LocalProgressForm
{
    public const int MaxItems = 20;

    [Required(ErrorMessage = "Не указана профессия")]
    [MaxLength(32)]
    public string ProfessionCode { get; init; } = "";

    [Range(0, 1000, ErrorMessage = "Уровень должен быть от 0 до 1000")]
    public int Level { get; init; }

    [Range(0, 100, ErrorMessage = "Процент прохождения должен быть от 0 до 100")]
    public int Percent { get; init; }

    [EnumDataType(typeof(Difficulty), ErrorMessage = "Неизвестный уровень сложности")]
    public Difficulty Difficulty { get; init; } = Difficulty.Normal;

    public JsonElement? State { get; init; }
}
