using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Hackat.Players.Contracts.Admin;

[JsonConverter(typeof(JsonStringEnumConverter<PlayerKind>))]
public enum PlayerKind
{
    All = 0,
    Guests = 1,
    Registered = 2,
}

public sealed class AdminPlayersFilterForm
{
    /// <summary>Часть никнейма или почты (без учёта регистра).</summary>
    [MaxLength(254)]
    public string? Search { get; init; }

    [EnumDataType(typeof(PlayerKind), ErrorMessage = "Неизвестный тип игрока")]
    public PlayerKind Kind { get; init; } = PlayerKind.All;

    [Range(0, int.MaxValue)]
    public int Offset { get; init; }

    [Range(1, 100, ErrorMessage = "Count должен быть от 1 до 100")]
    public int Count { get; init; } = 20;
}
