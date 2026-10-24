using System.Threading.RateLimiting;
using Hackat.Common.Result.ErrorCodes;

namespace Api.Common;

/// <summary>
/// Лимиты попыток входа и регистрации с одного IP — против подбора паролей.
/// По умолчанию 10 в минуту; AUTH_RATE_LIMIT_PER_MINUTE меняет лимит (например, в тестах).
/// </summary>
public static class AuthRateLimits
{
    public const string AdminLogin = "admin-login";
    public const string PlayerAuth = "player-auth";

    private const int DefaultPerMinute = 10;

    public static IServiceCollection AddAuthRateLimits(this IServiceCollection services) =>
        services.AddRateLimiter(o =>
        {
            o.AddPolicy(AdminLogin, PerIp);
            o.AddPolicy(PlayerAuth, PerIp);
            o.OnRejected = (context, _) =>
                new ValueTask(AppResultResponses.WriteError(context.HttpContext, AppErrorCodes.TooManyRequests));
        });

    private static RateLimitPartition<string> PerIp(HttpContext context)
    {
        var permitLimit = context.RequestServices.GetRequiredService<IConfiguration>()
            .GetValue("AUTH_RATE_LIMIT_PER_MINUTE", DefaultPerMinute);

        return RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions { PermitLimit = permitLimit, Window = TimeSpan.FromMinutes(1) });
    }
}
