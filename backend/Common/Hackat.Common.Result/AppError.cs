using System.Diagnostics;
using Hackat.Common.Result.ErrorCodes;

namespace Hackat.Common.Result;

[DebuggerDisplay("[Code: {Code}][{Message}]")]
public sealed record AppError(AppErrorCodes Code, string Message)
{
    public static AppError FromCode(AppErrorCodes code, string? message = null) =>
        new(code, message ?? code.ToFriendlyString());

    /// <summary>Сообщение из описания кода с подстановкой аргументов: «Никнейм «{0}» уже занят».</summary>
    public static AppError FromCodeWithArgs(AppErrorCodes code, params object[] args) =>
        new(code, string.Format(code.ToFriendlyString(), args));

    public static implicit operator AppError(AppErrorCodes code) => FromCode(code);
}
