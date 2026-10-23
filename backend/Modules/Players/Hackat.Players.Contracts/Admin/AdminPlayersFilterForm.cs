using System.ComponentModel.DataAnnotations;

namespace Hackat.Players.Contracts.Admin;

public sealed class AdminPlayersFilterForm
{
    /// <summary>Часть никнейма (без учёта регистра).</summary>
    [MaxLength(32)]
    public string? Search { get; init; }

    [Range(0, int.MaxValue)]
    public int Offset { get; init; }

    [Range(1, 100, ErrorMessage = "Count должен быть от 1 до 100")]
    public int Count { get; init; } = 20;
}
