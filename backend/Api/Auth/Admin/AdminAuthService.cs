using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Hackat.Common.Result;
using Hackat.Common.Result.ErrorCodes;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace Api.Auth.Admin;

public sealed class AdminAuthService(AdminAuthOptions options, TimeProvider timeProvider)
{
    public AppResult<AdminTokenModel> Login(AdminLoginForm form)
    {
        if (options.Password is null)
            return AppErrorCodes.AdminLoginDisabled;

        // Сравниваем хеши за постоянное время — без подсказок по таймингу.
        var loginOk = FixedTimeEquals(form.Login, options.Login);
        var passwordOk = FixedTimeEquals(form.Password, options.Password);
        if (!(loginOk & passwordOk))
            return AppErrorCodes.InvalidCredentials;

        var expiresAt = timeProvider.GetUtcNow().Add(options.TokenLifetime);
        var token = new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
        {
            Issuer = AdminAuthOptions.Issuer,
            Audience = AdminAuthOptions.Audience,
            Subject = new ClaimsIdentity(
            [
                new Claim(JwtRegisteredClaimNames.Sub, options.Login),
                new Claim("role", AdminAuthOptions.RoleName),
            ]),
            IssuedAt = timeProvider.GetUtcNow().UtcDateTime,
            NotBefore = timeProvider.GetUtcNow().UtcDateTime,
            Expires = expiresAt.UtcDateTime,
            SigningCredentials = new SigningCredentials(options.SigningKey, SecurityAlgorithms.HmacSha256),
        });

        return new AdminTokenModel(token, expiresAt, options.Login);
    }

    private static bool FixedTimeEquals(string actual, string expected) =>
        CryptographicOperations.FixedTimeEquals(
            SHA256.HashData(Encoding.UTF8.GetBytes(actual)),
            SHA256.HashData(Encoding.UTF8.GetBytes(expected)));
}
