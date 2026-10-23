using Hackat.Players.Database.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Hackat.Players.Database.Context;

/// <summary>
/// Фабрика для dotnet ef (migrations add / database update).
/// Строка подключения: переменная PLAYERS_DESIGN_CONNECTION или локальная БД из docker-compose.
/// </summary>
public class PlayersDesignTimeFactory : IDesignTimeDbContextFactory<PlayersDbContext>
{
    private const string DefaultConnection = "Host=localhost;Port=5432;Database=appdb;Username=user;Password=password";

    public PlayersDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("PLAYERS_DESIGN_CONNECTION") ?? DefaultConnection;

        var builder = new DbContextOptionsBuilder<PlayersDbContext>();
        builder.UsePlayersNpgsql(connectionString);

        return new PlayersDbContext(builder.Options);
    }
}
