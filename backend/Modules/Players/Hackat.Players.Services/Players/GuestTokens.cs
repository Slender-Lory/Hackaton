using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;

namespace Hackat.Players.Services.Players;

/// <summary>
/// Гостевой токен: 32 случайных байта (base64url). В БД хранится только SHA-256 —
/// при утечке БД токены не восстановить. Для токена с такой энтропией соль/медленный хеш не нужны.
/// </summary>
internal static class GuestTokens
{
    private const int TokenBytes = 32;

    public static (string Token, string Hash) Generate()
    {
        var token = Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(TokenBytes));
        return (token, Hash(token));
    }

    public static string Hash(string token) =>
        Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
