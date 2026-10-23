using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;
using Hackat.Common.Result.ErrorCodes;

namespace Hackat.Common.Result;

/// <summary>
/// Результат операции сервиса: либо успех, либо <see cref="AppError"/>.
/// Сервисы не бросают исключения для ожидаемых ошибок — они возвращают код.
/// </summary>
[DebuggerDisplay("[IsCorrect: {IsCorrect}]{Error}")]
public class AppResult
{
    public AppResult()
    {
    }

    public AppResult(AppError? error)
    {
        Error = error;
    }

    public AppError? Error { get; init; }

    [JsonIgnore]
    [MemberNotNullWhen(false, nameof(Error))]
    public bool IsCorrect => Error is null || Error.Code == AppErrorCodes.Ok;

    public static AppResult Success() => new();

    public static implicit operator AppResult(AppErrorCodes code) => new(AppError.FromCode(code));
    public static implicit operator AppResult(AppError error) => new(error);
}

[DebuggerDisplay("[IsCorrect: {IsCorrect}][Result: {Result}]{Error}")]
public sealed class AppResult<T> : AppResult
{
    public AppResult()
    {
    }

    public AppResult(T result)
    {
        Result = result;
    }

    public AppResult(AppError error) : base(error)
    {
    }

    public T? Result { get; init; }

    /// <summary>Переносит ошибку в результат другого типа.</summary>
    public AppResult<TOther> ConvertWithError<TOther>() =>
        IsCorrect ? throw new InvalidOperationException("Result is correct, nothing to convert") : new(Error);

    public static implicit operator AppResult<T>(T result) => new(result);
    public static implicit operator AppResult<T>(AppErrorCodes code) => new(AppError.FromCode(code));
    public static implicit operator AppResult<T>(AppError error) => new(error);
}
