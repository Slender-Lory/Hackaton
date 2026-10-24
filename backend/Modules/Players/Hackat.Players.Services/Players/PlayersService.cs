using Hackat.Common.Result;
using Hackat.Common.Result.ErrorCodes;
using Hackat.Players.Contracts.Players;
using Hackat.Players.Database.Entities;
using Hackat.Players.Services.Mapping;
using Hackat.Players.Services.Players.DatabaseQueries;
using Hackat.Players.Services.Progress;
using Hackat.Players.Services.Sessions;
using Microsoft.AspNetCore.Identity;

namespace Hackat.Players.Services.Players;

internal sealed class PlayersService(
    IPlayersDatabaseQueries databaseQueries,
    SessionsService sessionsService,
    IProgressService progressService,
    IPasswordHasher<Player> passwordHasher,
    TimeProvider timeProvider) : IPlayersService
{
    /// <summary>
    /// Хеш несуществующего пароля: проверяем его, когда почта не найдена,
    /// чтобы по времени ответа нельзя было понять, зарегистрирована ли почта.
    /// </summary>
    private static readonly Lazy<string> _dummyHash =
        new(() => new PasswordHasher<Player>().HashPassword(new Player(), Guid.NewGuid().ToString()));

    public async Task<AppResult<AuthResultModel>> Register(RegisterForm form)
    {
        var nickname = NicknameNormalizer.ToDisplay(form.Nickname);
        if (nickname.Length is < RegisterForm.NicknameMinLength or > RegisterForm.NicknameMaxLength)
            return AppError.FromCode(AppErrorCodes.InvalidForm, "Никнейм должен быть от 2 до 24 символов");

        if (ProgressRules.ValidateLocal(form.Progress) is { } progressError)
            return progressError;

        var email = form.Email.Trim();
        var normalizedEmail = NormalizeEmail(email);
        if (await databaseQueries.IsEmailTaken(normalizedEmail))
            return AppError.FromCodeWithArgs(AppErrorCodes.EmailTaken, email);

        var now = timeProvider.GetUtcNow();
        var player = new Player
        {
            Id = Guid.CreateVersion7(now),
            Nickname = nickname,
            NormalizedNickname = NicknameNormalizer.ToKey(nickname),
            Email = email,
            NormalizedEmail = normalizedEmail,
            CreatedAt = now,
            LastSeenAt = now,
        };
        player.PasswordHash = passwordHasher.HashPassword(player, form.Password);

        // Между проверкой и вставкой почту мог занять другой запрос — решает уникальный индекс.
        if (!await databaseQueries.TryAdd(player))
            return AppError.FromCodeWithArgs(AppErrorCodes.EmailTaken, email);

        var (imported, skipped) = await progressService.ImportLocal(player.Id, form.Progress);
        return await IssueSession(player, imported, skipped);
    }

    public async Task<AppResult<AuthResultModel>> Login(LoginForm form)
    {
        if (ProgressRules.ValidateLocal(form.Progress) is { } progressError)
            return progressError;

        var player = await databaseQueries.GetByNormalizedEmail(NormalizeEmail(form.Email), trackChanges: true);
        if (player is null)
        {
            passwordHasher.VerifyHashedPassword(new Player(), _dummyHash.Value, form.Password);
            return AppErrorCodes.WrongEmailOrPassword;
        }

        if (!VerifyPassword(player, form.Password))
            return AppErrorCodes.WrongEmailOrPassword;

        player.LastSeenAt = timeProvider.GetUtcNow();
        await databaseQueries.SaveChanges();

        var (imported, skipped) = await progressService.ImportLocal(player.Id, form.Progress);
        return await IssueSession(player, imported, skipped);
    }

    public Task Logout(SessionInfo current) => sessionsService.Revoke(current.SessionId);

    public async Task<AppResult<bool>> DeleteAccount(Guid playerId, DeleteAccountForm form)
    {
        var player = await databaseQueries.GetById(playerId, trackChanges: true);
        if (player is null)
            return AppErrorCodes.PlayerNotFound;

        if (!VerifyPassword(player, form.Password))
            return AppErrorCodes.WrongPassword;

        await databaseQueries.Delete(playerId);
        return true;
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

    /// <summary>Проверяет пароль отслеживаемого игрока; при устаревшем формате хеша обновляет его.</summary>
    private bool VerifyPassword(Player player, string password)
    {
        var result = passwordHasher.VerifyHashedPassword(player, player.PasswordHash, password);
        if (result == PasswordVerificationResult.SuccessRehashNeeded)
            player.PasswordHash = passwordHasher.HashPassword(player, password);

        return result != PasswordVerificationResult.Failed;
    }

    private async Task<AppResult<AuthResultModel>> IssueSession(Player player, string[] imported, string[] skipped)
    {
        var (token, expiresAt) = await sessionsService.Create(player);
        return new AuthResultModel(player.ToModel(), token, expiresAt, imported, skipped);
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
