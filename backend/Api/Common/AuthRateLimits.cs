using System.Threading.RateLimiting;
using Hackat.Common.Result.ErrorCodes;

namespace Api.Common;

/// <summary>Лимиты попыток входа: 10 в минуту с одного IP — против подбора паролей.</summary>
public static class AuthRateLimits
{
    public const string AdminLogin = "admin-login";
    public const string PlayerAuth = "player-auth";

    public static IServiceCollection AddAuthRateLimits(this IServiceCollection services) =>
        services.AddRateLimiter(o =>
        {
            o.AddPolicy(AdminLogin, PerIp);
            o.AddPolicy(PlayerAuth, PerIp);
            o.OnRejected = (context, _) =>
                new ValueTask(AppResultResponses.WriteError(context.HttpContext, AppErrorCodes.TooManyRequests));
        });

    private static RateLimitPartition<string> PerIp(HttpContext context) =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1) });
}
