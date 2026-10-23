using System.ComponentModel.DataAnnotations;

namespace Hackat.Players.Contracts.Players;

/// <summary>
/// Регистрация. Если запрос пришёл с сессией гостя — гость становится аккаунтом вместе с прогрессом,
/// иначе создаётся новый игрок (тогда нужен <see cref="Nickname"/>).
/// </summary>
public sealed class RegisterForm
{
    public const int PasswordMinLength = 8;

    [Required(ErrorMessage = "Введите почту")]
    [MaxLength(254, ErrorMessage = "Слишком длинная почта")]
    [EmailAddress(ErrorMessage = "Некорректная почта")]
    public string Email { get; init; } = "";

    [Required(ErrorMessage = "Введите пароль")]
    [MinLength(PasswordMinLength, ErrorMessage = "Пароль должен быть не короче 8 символов")]
    [MaxLength(128, ErrorMessage = "Пароль должен быть не длиннее 128 символов")]
    public string Password { get; init; } = "";

    /// <summary>Новый никнейм; для гостя можно не указывать — останется текущий.</summary>
    [MinLength(EnterForm.NicknameMinLength, ErrorMessage = "Никнейм должен быть не короче 2 символов")]
    [MaxLength(EnterForm.NicknameMaxLength, ErrorMessage = "Никнейм должен быть не длиннее 24 символов")]
    [RegularExpression(EnterForm.NicknamePattern, ErrorMessage = "В никнейме можно использовать буквы, цифры, пробел, «_» и «-»")]
    public string? Nickname { get; init; }
}

public sealed class LoginForm
{
    [Required(ErrorMessage = "Введите почту")]
    [MaxLength(254)]
    public string Email { get; init; } = "";

    [Required(ErrorMessage = "Введите пароль")]
    [MaxLength(128)]
    public string Password { get; init; } = "";
}
