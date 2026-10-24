using Hackat.Players.Contracts.Progress;

namespace Hackat.Players.Contracts.Admin;

/// <summary>Краткий прогресс по профессии для списка игроков (без State).</summary>
public sealed record ProgressSummaryModel(
    string ProfessionCode,
    string ProfessionTitle,
    int Level,
    int Percent,
    Difficulty Difficulty,
    int Revision,
    DateTimeOffset UpdatedAt);

public sealed record AdminPlayerListItemModel(
    Guid Id,
    string Nickname,
    string Email,
    DateTimeOffset CreatedAt,
    DateTimeOffset LastSeenAt,
    ProgressSummaryModel[] Progress);

/// <summary>Карточка игрока: прогресс по всем профессиям вместе со State.</summary>
public sealed record AdminPlayerDetailsModel(
    Guid Id,
    string Nickname,
    string Email,
    DateTimeOffset CreatedAt,
    DateTimeOffset LastSeenAt,
    ProgressModel[] Progress);

public sealed record ProfessionStatsModel(
    string ProfessionCode,
    string ProfessionTitle,
    int Started,
    int Completed,
    double AveragePercent);

/// <param name="TotalPlayers">Зарегистрированные игроки (гости на сервере не хранятся).</param>
public sealed record AdminStatsModel(
    int TotalPlayers,
    int NewLast24Hours,
    int ActiveLast24Hours,
    ProfessionStatsModel[] Professions);
