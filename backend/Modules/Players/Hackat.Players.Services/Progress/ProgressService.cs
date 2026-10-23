using System.Text;
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

    public async Task<AppResult<ProgressModel>> Save(Guid playerId, string professionCode, SaveProgressForm form)
    {
        if (!ProfessionCatalog.IsKnown(professionCode))
            return AppError.FromCodeWithArgs(AppErrorCodes.UnknownProfession, professionCode);

        var stateError = ValidateState(form.State);
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

    private static AppError? ValidateState(JsonElement? state)
    {
        if (state is not { } value || value.ValueKind == JsonValueKind.Null)
            return null;

        if (value.ValueKind != JsonValueKind.Object)
            return AppError.FromCode(AppErrorCodes.InvalidForm, "State должен быть JSON-объектом");

        if (Encoding.UTF8.GetByteCount(value.GetRawText()) > SaveProgressForm.MaxStateBytes)
            return AppError.FromCode(AppErrorCodes.InvalidForm, "State слишком большой (максимум 32 КБ)");

        return null;
    }
}
