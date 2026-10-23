using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Testcontainers.PostgreSql;

// SetUpFixture действует на своё пространство имён и вложенные — поэтому корневое namespace тестов.
namespace Hackat.Players.Tests;

/// <summary>
/// Один PostgreSQL в Docker (Testcontainers) и один экземпляр API на весь прогон тестов.
/// Миграции применяются при старте API (Database:MigrateOnStartup). Нужен запущенный Docker.
/// </summary>
[SetUpFixture]
public sealed class ApiFixture
{
    public const string AdminLogin = "test-admin";
    public const string AdminPassword = "test-admin-password";

    private static PostgreSqlContainer? _postgres;
    private static WebApplicationFactory<Program>? _factory;

    public static WebApplicationFactory<Program> Factory =>
        _factory ?? throw new InvalidOperationException("ApiFixture is not initialized");

    [OneTimeSetUp]
    public async Task StartAsync()
    {
        _postgres = new PostgreSqlBuilder("postgres:16").Build();
        await _postgres.StartAsync();

        _factory = CreateFactory();

        // Первый запрос поднимает хост и применяет миграции.
        using var client = _factory.CreateClient();
        (await client.GetAsync("/health")).EnsureSuccessStatusCode();
    }

    /// <summary>Отдельный экземпляр API над той же БД (своё состояние в памяти, например лимитов запросов).</summary>
    public static WebApplicationFactory<Program> CreateFactory()
    {
        var connectionString = _postgres?.GetConnectionString()
            ?? throw new InvalidOperationException("Postgres is not started");

        // ConfigureAppConfiguration добавляет источник последним — он перекрывает appsettings и env.
        return new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
            builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["DATABASE_URL"] = "",
                ["ConnectionStrings:Default"] = connectionString,
                ["ADMIN_LOGIN"] = AdminLogin,
                ["ADMIN_PASSWORD"] = AdminPassword,
                ["JWT_SECRET"] = "integration-tests-secret-0123456789abcdef",
            })));
    }

    [OneTimeTearDown]
    public async Task StopAsync()
    {
        if (_factory is not null)
            await _factory.DisposeAsync();
        if (_postgres is not null)
            await _postgres.DisposeAsync();
    }
}
