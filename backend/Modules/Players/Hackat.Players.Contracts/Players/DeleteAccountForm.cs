using System.ComponentModel.DataAnnotations;

namespace Hackat.Players.Contracts.Players;

/// <summary>Удаление аккаунта: пароль защищает от случайного удаления и от чужого токена.</summary>
public sealed class DeleteAccountForm
{
    [Required(ErrorMessage = "Введите пароль")]
    [MaxLength(128)]
    public string Password { get; init; } = "";
}
