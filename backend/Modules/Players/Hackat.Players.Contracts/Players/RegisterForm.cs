using System.ComponentModel.DataAnnotations;
using Hackat.Players.Contracts.Progress;

namespace Hackat.Players.Contracts.Players;

/// <summary>
/// Регистрация по почте и паролю. Гость играет без сервера (прогресс в localStorage),
/// поэтому его текущий прогресс приходит здесь же — аккаунт создаётся сразу с ним.
/// </summary>
public sealed class RegisterForm
{
    public const int PasswordMinLength = 8;
    public const int NicknameMinLength = 2;
    public const int NicknameMaxLength = 24;

    /// <summary>Буквы любого алфавита, цифры, пробел, «_» и «-».</summary>
    public const string NicknamePattern = @"^[\p{L}\p{Nd}_\- ]+$";

    [Required(ErrorMessage = "Введите почту")]
    [MaxLength(254, ErrorMessage = "Слишком длинная почта")]
    [EmailAddress(ErrorMessage = "Некорректная почта")]
    public string Email { get; init; } = "";

    [Required(ErrorMessage = "Введите пароль")]
    [MinLength(PasswordMinLength, ErrorMessage = "Пароль должен быть не короче 8 символов")]
    [MaxLength(128, ErrorMessage = "Пароль должен быть не длиннее 128 символов")]
    public string Password { get; init; } = "";

    /// <summary>Как к игроку обращаются персонажи. Не уникален.</summary>
    [Required(ErrorMessage = "Введите никнейм")]
    [MinLength(NicknameMinLength, ErrorMessage = "Никнейм должен быть не короче 2 символов")]
    [MaxLength(NicknameMaxLength, ErrorMessage = "Никнейм должен быть не длиннее 24 символов")]
    [RegularExpression(NicknamePattern, ErrorMessage = "В никнейме можно использовать буквы, цифры, пробел, «_» и «-»")]
    public string Nickname { get; init; } = "";

    /// <summary>Прогресс гостя из localStorage (по одной записи на профессию). Можно не передавать.</summary>
    [MaxLength(LocalProgressForm.MaxItems, ErrorMessage = "Слишком много записей прогресса")]
    public LocalProgressForm[]? Progress { get; init; }
}

/// <summary>
/// Вход по почте и паролю. Если гость в этом браузере уже играл — его прогресс из localStorage
/// переносится в профессии, которые в аккаунте ещё не начаты.
/// </summary>
public sealed class LoginForm
{
    [Required(ErrorMessage = "Введите почту")]
    [MaxLength(254)]
    public string Email { get; init; } = "";

    [Required(ErrorMessage = "Введите пароль")]
    [MaxLength(128)]
    public string Password { get; init; } = "";

    [MaxLength(LocalProgressForm.MaxItems, ErrorMessage = "Слишком много записей прогресса")]
    public LocalProgressForm[]? Progress { get; init; }
}
