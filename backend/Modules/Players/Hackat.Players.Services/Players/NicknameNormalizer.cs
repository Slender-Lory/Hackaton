using System.Text;
using System.Text.RegularExpressions;

namespace Hackat.Players.Services.Players;

internal static partial class NicknameNormalizer
{
    /// <summary>Как показываем: без пробелов по краям, повторяющиеся пробелы схлопнуты.</summary>
    public static string ToDisplay(string nickname) =>
        MultipleSpaces().Replace(nickname.Trim(), " ").Normalize(NormalizationForm.FormC);

    /// <summary>
    /// Ключ уникальности: «Вася», «вася» и « ВАСЯ » — один и тот же никнейм.
    /// Сравниваем в БД по этому полю, а не через OrdinalIgnoreCase в запросе.
    /// </summary>
    public static string ToKey(string displayNickname) =>
        displayNickname.Normalize(NormalizationForm.FormKC).ToLowerInvariant();

    [GeneratedRegex(@"\s{2,}")]
    private static partial Regex MultipleSpaces();
}
