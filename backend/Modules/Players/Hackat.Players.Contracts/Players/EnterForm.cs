using System.ComponentModel.DataAnnotations;

namespace Hackat.Players.Contracts.Players;

/// <summary>
/// Игра без регистрации: создаётся гость с этим никнеймом (никнеймы не уникальны).
/// Вернуться к гостю можно только из того же браузера — по токену его сессии.
/// </summary>
public sealed class EnterForm
{
    public const int NicknameMinLength = 2;
    public const int NicknameMaxLength = 24;

    /// <summary>Буквы любого алфавита, цифры, пробел, «_» и «-».</summary>
    public const string NicknamePattern = @"^[\p{L}\p{Nd}_\- ]+$";

    [Required(ErrorMessage = "Введите никнейм")]
    [MinLength(NicknameMinLength, ErrorMessage = "Никнейм должен быть не короче 2 символов")]
    [MaxLength(NicknameMaxLength, ErrorMessage = "Никнейм должен быть не длиннее 24 символов")]
    [RegularExpression(NicknamePattern, ErrorMessage = "В никнейме можно использовать буквы, цифры, пробел, «_» и «-»")]
    public string Nickname { get; init; } = "";
}
