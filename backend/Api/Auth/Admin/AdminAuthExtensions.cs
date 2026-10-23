using System.Threading.RateLimiting;
using Api.Common;
using Hackat.Common.Result.ErrorCodes;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace Api.Auth.Admin;

public static class AdminAuthExtensions
{
    public const string LoginRateLimitPolicy = "admin-login";

    /// <summary>
    /// Схема AdminJwt (Authorization: Bearer &lt;jwt&gt;) + политика Admin + лимит попыток входа.
    /// Гостевой токен на админских эндпоинтах не принимается, и наоборот.
    /// Настройки читаются из конфигурации при первом обращении — тесты могут её подменить.
    /// </summary>
    public static AuthenticationBuilder AddAdminJwt(this AuthenticationBuilder builder)
    {
        var services = builder.Services;

        services.AddSingleton(sp => AdminAuthOptions.FromConfiguration(
            sp.GetRequiredService<IConfiguration>(),
            sp.GetRequiredService<IHostEnvironment>()));
        services.AddSingleton<AdminAuthService>();

        services.AddAuthorizationBuilder()
            .AddPolicy(AdminAuthOptions.PolicyName, p => p
                .AddAuthenticationSchemes(AdminAuthOptions.SchemeName)
                .RequireAuthenticatedUser()
                .RequireRole(AdminAuthOptions.RoleName));

        services.AddRateLimiter(o =>
        {
            o.AddPolicy(LoginRateLimitPolicy, context => RateLimitPartition.GetFixedWindowLimiter(
                context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1) }));
            o.OnRejected = (context, _) =>
                new ValueTask(AppResultResponses.WriteError(context.HttpContext, AppErrorCodes.TooManyRequests));
        });

        services.AddOptions<JwtBearerOptions>(AdminAuthOptions.SchemeName)
            .Configure<AdminAuthOptions>((o, admin) =>
            {
                o.MapInboundClaims = false;
                o.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidIssuer = AdminAuthOptions.Issuer,
                    ValidAudience = AdminAuthOptions.Audience,
                    IssuerSigningKey = admin.SigningKey,
                    RoleClaimType = "role",
                    NameClaimType = "sub",
                    ClockSkew = TimeSpan.FromMinutes(1),
                };
                o.Events = new JwtBearerEvents
                {
                    OnChallenge = context =>
                    {
                        context.HandleResponse();
                        return AppResultResponses.WriteError(context.HttpContext, AppErrorCodes.Unauthorized);
                    },
                    OnForbidden = context => AppResultResponses.WriteError(context.HttpContext, AppErrorCodes.Forbidden),
                };
            });

        return builder.AddJwtBearer(AdminAuthOptions.SchemeName);
    }
}
