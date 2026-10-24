using Hackat.Common.Result;
using Hackat.Players.Contracts.Players;
using Hackat.Players.Services.Sessions;

namespace Hackat.Players.Services.Players;

/// <summary>
/// Аккаунты игроков. Гостевой режим живёт только на фронте (никнейм и прогресс в localStorage) —
/// сервер узнаёт о госте, когда тот регистрируется или входит, и забирает его прогресс.
/// </summary>
public interface IPlayersService
{
    /// <summary>Регистрация по почте и паролю; аккаунт создаётся сразу с прогрессом гостя из браузера.</summary>
    Task<AppResult<AuthResultModel>> Register(RegisterForm form);

    /// <summary>Вход по почте и паролю; прогресс гостя переносится в не начатые в аккаунте профессии.</summary>
    Task<AppResult<AuthResultModel>> Login(LoginForm form);

    /// <summary>Выход с текущего устройства.</summary>
    Task Logout(SessionInfo current);

    /// <summary>Удаление аккаунта вместе с прогрессом и всеми сессиями. Нужен пароль.</summary>
    Task<AppResult<bool>> DeleteAccount(Guid playerId, DeleteAccountForm form);

    Task<AppResult<PlayerProfileModel>> GetProfile(Guid playerId);
}
