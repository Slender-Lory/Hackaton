using Hackat.Players.Database.Entities;

namespace Hackat.Players.Services.Admin.DatabaseQueries;

internal interface IPlayersAdminDatabaseQueries
{
    /// <summary>Игроки с прогрессом, недавно активные — первыми.</summary>
    Task<Player[]> Search(string? normalizedSearch, int offset, int count);

    Task<int> Count(string? normalizedSearch);

    Task<int> CountCreatedSince(DateTimeOffset since);

    Task<int> CountSeenSince(DateTimeOffset since);

    Task<ProfessionAggregate[]> AggregateProgress();
}

internal sealed record ProfessionAggregate(string ProfessionCode, int Started, int Completed, double AveragePercent);
