using Hackat.Common.Result;
using Hackat.Players.Contracts.Players;
using Hackat.Players.Services.Sessions;

namespace Hackat.Players.Services.Players;

public interface IPlayersService
{
    /// <summary>Игра без регистрации: создаёт гостя и его сессию.</summary>
    Task<AppResult<AuthResultModel>> Enter(EnterForm form);

    /// <summary>
    /// Регистрация по почте. С сессией гостя (<paramref name="current"/>) гость становится аккаунтом
    /// вместе с прогрессом; без сессии создаётся новый игрок. Выдаётся новая сессия на 30 дней.
    /// </summary>
    Task<AppResult<AuthResultModel>> Register(RegisterForm form, SessionInfo? current);

    /// <summary>
    /// Вход по почте и паролю. Если запрос пришёл с сессией гостя — его прогресс переносится в аккаунт
    /// (только не начатые там профессии), а гость удаляется.
    /// </summary>
    Task<AppResult<LoginResultModel>> Login(LoginForm form, SessionInfo? current);

    /// <summary>Выход с текущего устройства. Гостю после этого вернуться к своему прогрессу нельзя.</summary>
    Task Logout(SessionInfo current);

    Task<AppResult<PlayerProfileModel>> GetProfile(Guid playerId);
}
