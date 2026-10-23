using System.Collections.Concurrent;
using System.ComponentModel;
using System.Reflection;

namespace Hackat.Common.Result.ErrorCodes;

public static class AppErrorCodesExtensions
{
    private static readonly ConcurrentDictionary<AppErrorCodes, (string Message, int Status)> _meta = new();

    /// <summary>Сообщение по умолчанию из <see cref="DescriptionAttribute"/>.</summary>
    public static string ToFriendlyString(this AppErrorCodes code) => GetMeta(code).Message;

    /// <summary>HTTP-статус из <see cref="HttpStatusAttribute"/> (500, если не задан).</summary>
    public static int ToHttpStatus(this AppErrorCodes code) => GetMeta(code).Status;

    private static (string Message, int Status) GetMeta(AppErrorCodes code) =>
        _meta.GetOrAdd(code, static c =>
        {
            var field = typeof(AppErrorCodes).GetField(c.ToString());
            var message = field?.GetCustomAttribute<DescriptionAttribute>()?.Description ?? c.ToString();
            var status = field?.GetCustomAttribute<HttpStatusAttribute>()?.StatusCode ?? 500;
            return (message, status);
        });
}
