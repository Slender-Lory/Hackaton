using System.Text.Json;
using Hackat.Common.Result;
using Hackat.Common.Result.ErrorCodes;
using Hackat.Players.Contracts.Professions;
using Hackat.Players.Contracts.Progress;
using Hackat.Players.Database.Entities;
using Hackat.Players.Services.Mapping;
using Hackat.Players.Services.Progress.DatabaseQueries;

namespace Hackat.Players.Services.Progress;

internal sealed class ProgressService(
    IProgressDatabaseQueries databaseQueries,
    TimeProvider timeProvider) : IProgressService
{
    public async Task<ProgressModel[]> GetAll(Guid playerId)
    {
        var saved = (await databaseQueries.GetByPlayer(playerId))
            .ToDictionary(u => u.ProfessionCode, StringComparer.Ordinal);

        return ProfessionCatalog.Titles.Keys
            .Select(code => saved.TryGetValue(code, out var progress)
                ? progress.ToModel()
                : PlayersMapping.EmptyProgress(code))
            .ToArray();
    }

    public async Task<AppResult<ProgressModel>> Get(Guid playerId, string professionCode)
    {
        if (!ProfessionCatalog.IsKnown(professionCode))
            return AppError.FromCodeWithArgs(AppErrorCodes.UnknownProfession, professionCode);

        var progress = await databaseQueries.Get(playerId, professionCode);
        return progress?.ToModel() ?? PlayersMapping.EmptyProgress(professionCode);
    }

    public async Task<(string[] Imported, string[] Skipped)> ImportLocal(Guid playerId, LocalProgressForm[]? items)
    {
        if (items is null || items.Length == 0)
            return ([], []);

        var now = timeProvider.GetUtcNow();
        var imported = await databaseQueries.AddMissing(playerId, items
            .Select(u => new PlayerProgress
            {
                PlayerId = playerId,
                ProfessionCode = u.ProfessionCode,
                Level = u.Level,
                Percent = u.Percent,
                Difficulty = u.Difficulty,
                State = u.State is { ValueKind: not JsonValueKind.Null } state ? state.GetRawText() : null,
                Revision = 1,
                UpdatedAt = now,
            })
            .ToArray());

        var skipped = items.Select(u => u.ProfessionCode).Except(imported).ToArray();
        return (imported, skipped);
    }

    public async Task<AppResult<ProgressModel>> Save(Guid playerId, string professionCode, SaveProgressForm form)
    {
        if (!ProfessionCatalog.IsKnown(professionCode))
            return AppError.FromCodeWithArgs(AppErrorCodes.UnknownProfession, professionCode);

        var stateError = ProgressRules.ValidateState(form.State);
        if (stateError is not null)
            return stateError;

        var now = timeProvider.GetUtcNow();
        var state = form.State?.GetRawText();
        var progress = await databaseQueries.Get(playerId, professionCode, trackChanges: true);

        if (progress is null)
        {
            if (form.ExpectedRevision != 0)
                return AppErrorCodes.ProgressConflict;

            progress = new PlayerProgress
            {
                PlayerId = playerId,
                ProfessionCode = professionCode,
                Level = form.Level,
                Percent = form.Percent,
                Difficulty = form.Difficulty,
                State = state,
                Revision = 1,
                UpdatedAt = now,
            };

            return await databaseQueries.TryAdd(progress)
                ? progress.ToModel()
                : AppErrorCodes.ProgressConflict;
        }

        if (progress.Revision != form.ExpectedRevision)
            return AppErrorCodes.ProgressConflict;

        progress.Level = form.Level;
        progress.Percent = form.Percent;
        progress.Difficulty = form.Difficulty;
        progress.State = state;
        progress.Revision++;
        progress.UpdatedAt = now;

        return await databaseQueries.TrySaveChanges()
            ? progress.ToModel()
            : AppErrorCodes.ProgressConflict;
    }
}
