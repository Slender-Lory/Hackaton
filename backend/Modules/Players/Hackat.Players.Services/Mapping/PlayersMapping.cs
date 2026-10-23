using System.Text.Json;
using Hackat.Players.Contracts.Admin;
using Hackat.Players.Contracts.Players;
using Hackat.Players.Contracts.Professions;
using Hackat.Players.Contracts.Progress;
using Hackat.Players.Database.Entities;

namespace Hackat.Players.Services.Mapping;

/// <summary>Маппинг сущностей БД в модели API (ручной: моделей мало, AutoMapper не нужен).</summary>
internal static class PlayersMapping
{
    public static PlayerModel ToModel(this Player player) =>
        new(player.Id, player.Nickname, player.IsRegistered, player.Email, player.CreatedAt);

    public static ProgressModel ToModel(this PlayerProgress progress) =>
        new(
            progress.ProfessionCode,
            ProfessionTitle(progress.ProfessionCode),
            progress.Level,
            progress.Percent,
            progress.Difficulty,
            ParseState(progress.State),
            progress.Revision,
            progress.UpdatedAt);

    public static AdminPlayerListItemModel ToAdminListItem(this Player player) =>
        new(
            player.Id,
            player.Nickname,
            player.IsRegistered,
            player.Email,
            player.CreatedAt,
            player.RegisteredAt,
            player.LastSeenAt,
            player.Progress
                .OrderBy(u => u.ProfessionCode, StringComparer.Ordinal)
                .Select(u => new ProgressSummaryModel(
                    u.ProfessionCode,
                    ProfessionTitle(u.ProfessionCode),
                    u.Level,
                    u.Percent,
                    u.Difficulty,
                    u.Revision,
                    u.UpdatedAt))
                .ToArray());

    /// <summary>Прогресс профессии, которую игрок ещё не начинал.</summary>
    public static ProgressModel EmptyProgress(string professionCode) =>
        new(professionCode, ProfessionTitle(professionCode), 0, 0, Difficulty.Normal, null, 0, null);

    private static string ProfessionTitle(string code) =>
        ProfessionCatalog.Titles.GetValueOrDefault(code, code);

    private static JsonElement? ParseState(string? state)
    {
        if (state is null)
            return null;

        using var document = JsonDocument.Parse(state);
        return document.RootElement.Clone();
    }
}
