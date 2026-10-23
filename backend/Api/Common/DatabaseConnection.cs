using Npgsql;

namespace Api.Common;

public static class DatabaseConnection
{
    /// <summary>
    /// Строка подключения Npgsql. Приоритет:
    /// 1) DATABASE_URL (postgres://user:pass@host:port/db — так её задаёт docker-compose);
    /// 2) ConnectionStrings:Default (appsettings.Development.json — локальный запуск).
    /// </summary>
    public static string Resolve(IConfiguration configuration)
    {
        var databaseUrl = configuration["DATABASE_URL"];
        if (!string.IsNullOrWhiteSpace(databaseUrl))
            return FromUrl(databaseUrl);

        return configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException(
                "Не задано подключение к БД: укажите DATABASE_URL или ConnectionStrings:Default");
    }

    private static string FromUrl(string databaseUrl)
    {
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':', 2);

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.IsDefaultPort || uri.Port <= 0 ? 5432 : uri.Port,
            Database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/')),
            Username = Uri.UnescapeDataString(userInfo[0]),
            Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : null,
        };

        return builder.ConnectionString;
    }
}
