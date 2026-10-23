using Hackat.Players.Services.Admin;
using Hackat.Players.Services.Admin.DatabaseQueries;
using Hackat.Players.Services.Players;
using Hackat.Players.Services.Players.DatabaseQueries;
using Hackat.Players.Services.Progress;
using Hackat.Players.Services.Progress.DatabaseQueries;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Hackat.Players.Services.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPlayersServices(this IServiceCollection services)
    {
        services.TryAddSingleton(TimeProvider.System);

        services.AddScoped<IPlayersDatabaseQueries, PlayersDatabaseQueries>();
        services.AddScoped<IPlayersService, PlayersService>();

        services.AddScoped<IProgressDatabaseQueries, ProgressDatabaseQueries>();
        services.AddScoped<IProgressService, ProgressService>();

        services.AddScoped<IPlayersAdminDatabaseQueries, PlayersAdminDatabaseQueries>();
        services.AddScoped<IPlayersAdminService, PlayersAdminService>();

        return services;
    }
}
