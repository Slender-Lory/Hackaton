namespace Hackat.Players.Contracts.Professions;

/// <summary>
/// Профессии, по которым есть игровой контент. Новая профессия = новая запись здесь
/// (код хранится в БД в прогрессе, поэтому менять существующие коды нельзя).
/// </summary>
public static class ProfessionCatalog
{
    public const string Veterinarian = "vet";

    private static readonly Dictionary<string, string> _titles = new(StringComparer.Ordinal)
    {
        [Veterinarian] = "Ветеринар",
    };

    public static IReadOnlyDictionary<string, string> Titles => _titles;

    public static bool IsKnown(string? code) => code is not null && _titles.ContainsKey(code);
}
