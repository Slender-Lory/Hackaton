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

    public async Task<AppResult<AuthResultModel>> Enter(EnterForm form)
    {
        var nicknameResult = NormalizeNickname(form.Nickname);
        if (!nicknameResult.IsCorrect)
            return nicknameResult.ConvertWithError<AuthResultModel>();

        var now = timeProvider.GetUtcNow();
        var player = NewPlayer(nicknameResult.Result!, now);
        await databaseQueries.TryAdd(player);

        return await IssueSession(player);
    }

    public async Task<AppResult<AuthResultModel>> Register(RegisterForm form, SessionInfo? current)
    {
        var email = form.Email.Trim();
        var normalizedEmail = NormalizeEmail(email);
        var now = timeProvider.GetUtcNow();

        if (current is not null)
            return await UpgradeGuest(current, form, email, normalizedEmail, now);

        if (string.IsNullOrWhiteSpace(form.Nickname))
            return AppError.FromCode(AppErrorCodes.InvalidForm, "Введите никнейм");

        var nicknameResult = NormalizeNickname(form.Nickname);
        if (!nicknameResult.IsCorrect)
            return nicknameResult.ConvertWithError<AuthResultModel>();

        if (await databaseQueries.IsEmailTaken(normalizedEmail))
            return AppError.FromCodeWithArgs(AppErrorCodes.EmailTaken, email);

        var player = NewPlayer(nicknameResult.Result!, now);
        SetCredentials(player, email, normalizedEmail, form.Password, now);

        if (!await databaseQueries.TryAdd(player))
            return AppError.FromCodeWithArgs(AppErrorCodes.EmailTaken, email);

        return await IssueSession(player);
    }

    public async Task<AppResult<LoginResultModel>> Login(LoginForm form, SessionInfo? current)
    {
        var player = await databaseQueries.GetByNormalizedEmail(NormalizeEmail(form.Email), trackChanges: true);
        if (player?.PasswordHash is null)
        {
            passwordHasher.VerifyHashedPassword(new Player(), _dummyHash.Value, form.Password);
            return AppErrorCodes.WrongEmailOrPassword;
        }

        var verification = passwordHasher.VerifyHashedPassword(player, player.PasswordHash, form.Password);
        if (verification == PasswordVerificationResult.Failed)
            return AppErrorCodes.WrongEmailOrPassword;

        var now = timeProvider.GetUtcNow();
        if (verification == PasswordVerificationResult.SuccessRehashNeeded)
            player.PasswordHash = passwordHasher.HashPassword(player, form.Password);
        player.LastSeenAt = now;
        await databaseQueries.TrySaveChanges();

        string[] transferred = [];
        string[] discarded = [];
        if (current is { IsRegistered: false } && current.PlayerId != player.Id)
            (transferred, discarded) = await databaseQueries.MergeGuestInto(current.PlayerId, player.Id);

        var (token, expiresAt) = await sessionsService.Create(player);
        return new LoginResultModel(player.ToModel(), token, expiresAt, transferred, discarded);
    }

    public Task Logout(SessionInfo current) => sessionsService.Revoke(current.SessionId);

    public async Task<AppResult<PlayerProfileModel>> GetProfile(Guid playerId)
    {
        var player = await databaseQueries.GetById(playerId);
        if (player is null)
            return AppErrorCodes.PlayerNotFound;

        await databaseQueries.TouchLastSeen(playerId, timeProvider.GetUtcNow());
        var progress = await progressService.GetAll(playerId);

        return new PlayerProfileModel(player.ToModel(), progress);
    }

    private async Task<AppResult<AuthResultModel>> UpgradeGuest(
        SessionInfo current, RegisterForm form, string email, string normalizedEmail, DateTimeOffset now)
    {
        var player = await databaseQueries.GetById(current.PlayerId, trackChanges: true);
        if (player is null)
            return AppErrorCodes.PlayerNotFound;
        if (player.IsRegistered)
            return AppErrorCodes.AlreadyRegistered;

        if (!string.IsNullOrWhiteSpace(form.Nickname))
        {
            var nicknameResult = NormalizeNickname(form.Nickname);
            if (!nicknameResult.IsCorrect)
                return nicknameResult.ConvertWithError<AuthResultModel>();
            player.Nickname = nicknameResult.Result!;
            player.NormalizedNickname = NicknameNormalizer.ToKey(player.Nickname);
        }

        if (await databaseQueries.IsEmailTaken(normalizedEmail))
            return AppError.FromCodeWithArgs(AppErrorCodes.EmailTaken, email);

        SetCredentials(player, email, normalizedEmail, form.Password, now);
        if (!await databaseQueries.TrySaveChanges())
            return AppError.FromCodeWithArgs(AppErrorCodes.EmailTaken, email);

        // Бессрочная гостевая сессия заменяется сессией аккаунта (30 дней).
        await databaseQueries.DeleteSessions(player.Id);
        return await IssueSession(player);
    }

    private async Task<AppResult<AuthResultModel>> IssueSession(Player player)
    {
        var (token, expiresAt) = await sessionsService.Create(player);
        return new AuthResultModel(player.ToModel(), token, expiresAt);
    }

    private void SetCredentials(Player player, string email, string normalizedEmail, string password, DateTimeOffset now)
    {
        player.Email = email;
        player.NormalizedEmail = normalizedEmail;
        player.PasswordHash = passwordHasher.HashPassword(player, password);
        player.RegisteredAt = now;
        player.LastSeenAt = now;
    }

    private static Player NewPlayer(string nickname, DateTimeOffset now) => new()
    {
        Id = Guid.CreateVersion7(now),
        Nickname = nickname,
        NormalizedNickname = NicknameNormalizer.ToKey(nickname),
        CreatedAt = now,
        LastSeenAt = now,
    };

    private static AppResult<string> NormalizeNickname(string nickname)
    {
        var display = NicknameNormalizer.ToDisplay(nickname);
        return display.Length is < EnterForm.NicknameMinLength or > EnterForm.NicknameMaxLength
            ? AppError.FromCode(AppErrorCodes.InvalidForm, "Никнейм должен быть от 2 до 24 символов")
            : display;
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
