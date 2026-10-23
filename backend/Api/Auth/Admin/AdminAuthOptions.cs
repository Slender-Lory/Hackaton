using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Api.Auth.Admin;

/// <summary>
/// Настройки входа администратора. Аккаунт один и задаётся конфигурацией:
/// ADMIN_LOGIN / ADMIN_PASSWORD, токен подписывается JWT_SECRET.
/// </summary>
public sealed class AdminAuthOptions
{
    public const string SchemeName = "AdminJwt";
    public const string PolicyName = "Admin";
    public const string RoleName = "admin";
    public const string Issuer = "hackat-api";
    public const string Audience = "hackat-admin";

    private const string DevPassword = "admin12345";
    private const string DevJwtSecret = "change_me_at_least_32_chars";

    public required string Login { get; init; }

    /// <summary>null — вход администратора выключен.</summary>
    public required string? Password { get; init; }

    public required SymmetricSecurityKey SigningKey { get; init; }

    public TimeSpan TokenLifetime { get; init; } = TimeSpan.FromHours(12);

    public static AdminAuthOptions FromConfiguration(IConfiguration configuration, IHostEnvironment environment)
    {
        var login = NullIfEmpty(configuration["ADMIN_LOGIN"]) ?? "admin";
        var password = NullIfEmpty(configuration["ADMIN_PASSWORD"])
            ?? (environment.IsDevelopment() ? DevPassword : null);

        var secret = NullIfEmpty(configuration["JWT_SECRET"]);
        if (secret is null || secret == DevJwtSecret)
        {
            if (!environment.IsDevelopment())
                throw new InvalidOperationException("JWT_SECRET не задан: в не-Development окружении нужен свой секрет (>= 32 символов)");
            secret = DevJwtSecret;
        }

        return new AdminAuthOptions
        {
            Login = login,
            Password = password,
            // HMAC-SHA256 требует ключ >= 256 бит: выводим его из секрета любой длины.
            SigningKey = new SymmetricSecurityKey(SHA256.HashData(Encoding.UTF8.GetBytes(secret))),
        };
    }

    private static string? NullIfEmpty(string? value) => string.IsNullOrWhiteSpace(value) ? null : value;
}
