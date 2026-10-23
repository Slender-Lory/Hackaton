namespace Hackat.Common.Result.ErrorCodes;

/// <summary>
/// HTTP-статус, с которым API возвращает ошибку данного кода.
/// </summary>
[AttributeUsage(AttributeTargets.Field)]
public sealed class HttpStatusAttribute(int statusCode) : Attribute
{
    public int StatusCode { get; } = statusCode;
}
