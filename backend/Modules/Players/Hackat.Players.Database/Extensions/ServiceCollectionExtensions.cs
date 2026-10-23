using Hackat.Players.Database.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Hackat.Players.Database.Extensions;

public static class ServiceCollectionExtensions
{
    /// <param name="connectionString">Вычисляется при создании контекста — так тесты могут подменить конфигурацию.</param>
    public static IServiceCollection AddPlayersDatabase(
        this IServiceCollection services,
        Func<IServiceProvider, string> connectionString)
    {
        services.AddDbContext<PlayersDbContext>((sp, o) => o.UsePlayersNpgsql(connectionString(sp)));
        return services;
    }

    /// <summary>Npgsql + история миграций в схеме модуля (у каждого модуля своя история).</summary>
    internal static DbContextOptionsBuilder UsePlayersNpgsql(this DbContextOptionsBuilder builder, string connectionString) =>
        builder.UseNpgsql(connectionString, npgsql =>
            npgsql.MigrationsHistoryTable("__EFMigrationsHistory", PlayersDbContext.SchemaName));
}
