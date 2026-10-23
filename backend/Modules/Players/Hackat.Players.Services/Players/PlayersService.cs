using Hackat.Common.Result;
using Hackat.Common.Result.ErrorCodes;
using Hackat.Players.Contracts.Players;
using Hackat.Players.Database.Entities;
using Hackat.Players.Services.Mapping;
using Hackat.Players.Services.Players.DatabaseQueries;
using Hackat.Players.Services.Progress;

namespace Hackat.Players.Services.Players;

internal sealed class PlayersService(
    IPlayersDatabaseQueries databaseQueries,
    IProgressService progressService,
    TimeProvider timeProvider) : IPlayersService
{
    public async Task<AppResult<EnterResultModel>> Enter(EnterForm form, Guid? currentPlayerId)
    {
        var nickname = NicknameNormalizer.ToDisplay(form.Nickname);
        if (nickname.Length is < EnterForm.NicknameMinLength or > EnterForm.NicknameMaxLength)
            return AppError.FromCode(AppErrorCodes.InvalidForm, "Никнейм должен быть от 2 до 24 символов");

        var normalizedNickname = NicknameNormalizer.ToKey(nickname);
        var existing = await databaseQueries.GetByNormalizedNickname(normalizedNickname);
        if (existing is not null)
        {
            if (existing.Id != currentPlayerId)
                return AppError.FromCodeWithArgs(AppErrorCodes.NicknameTaken, existing.Nickname);

            await databaseQueries.TouchLastSeen(existing.Id, timeProvider.GetUtcNow());
            return new EnterResultModel(existing.ToModel(), IsNew: false, GuestToken: null);
        }

        var (token, tokenHash) = GuestTokens.Generate();
        var now = timeProvider.GetUtcNow();
        var player = new Player
        {
            Id = Guid.CreateVersion7(now),
            Nickname = nickname,
            NormalizedNickname = normalizedNickname,
            GuestTokenHash = tokenHash,
            CreatedAt = now,
            LastSeenAt = now,
        };

        // Между проверкой и вставкой никнейм мог занять другой игрок — решает уникальный индекс.
        if (!await databaseQueries.TryAdd(player))
            return AppError.FromCodeWithArgs(AppErrorCodes.NicknameTaken, nickname);

        return new EnterResultModel(player.ToModel(), IsNew: true, GuestToken: token);
    }

    public async Task<AppResult<PlayerProfileModel>> GetProfile(Guid playerId)
    {
        var player = await databaseQueries.GetById(playerId);
        if (player is null)
            return AppErrorCodes.PlayerNotFound;

        await databaseQueries.TouchLastSeen(playerId, timeProvider.GetUtcNow());
        var progress = await progressService.GetAll(playerId);

        return new PlayerProfileModel(player.ToModel(), progress);
    }

    public Task<Guid?> GetIdByGuestToken(string guestToken) =>
        databaseQueries.GetIdByGuestTokenHash(GuestTokens.Hash(guestToken));
}
