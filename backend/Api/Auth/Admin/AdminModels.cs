using System.ComponentModel.DataAnnotations;

namespace Api.Auth.Admin;

public sealed class AdminLoginForm
{
    [Required(ErrorMessage = "Введите логин")]
    [MaxLength(64)]
    public string Login { get; init; } = "";

    [Required(ErrorMessage = "Введите пароль")]
    [MaxLength(128)]
    public string Password { get; init; } = "";
}

/// <summary>JWT администратора: передаётся в заголовке <c>Authorization: Bearer &lt;token&gt;</c>.</summary>
public sealed record AdminTokenModel(string Token, DateTimeOffset ExpiresAt, string Login);
