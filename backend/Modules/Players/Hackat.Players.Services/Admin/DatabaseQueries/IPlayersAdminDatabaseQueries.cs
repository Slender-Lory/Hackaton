using Hackat.Players.Database.Entities;

namespace Hackat.Players.Services.Admin.DatabaseQueries;

internal interface IPlayersAdminDatabaseQueries
{
    /// <summary>Игроки с прогрессом, недавно активные — первыми.</summary>
    Task<Player[]> Search(PlayersSearch search, int offset, int count);

    Task<int> Count(PlayersSearch search);

    Task<int> CountCreatedSince(DateTimeOffset since);

    Task<int> CountSeenSince(DateTimeOffset since);

    Task<ProfessionAggregate[]> AggregateProgress();
}

/// <param name="NicknameKey">Нормализованная часть никнейма (null — без поиска).</param>
/// <param name="EmailPart">Часть почты в нижнем регистре.</param>
internal sealed record PlayersSearch(string? NicknameKey, string? EmailPart)
{
    public static readonly PlayersSearch Everyone = new(null, null);
}

internal sealed record ProfessionAggregate(string ProfessionCode, int Started, int Completed, double AveragePercent);
