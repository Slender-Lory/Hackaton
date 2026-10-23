using Hackat.Common.Result;
using Hackat.Players.Contracts.Players;

namespace Hackat.Players.Services.Players;

public interface IPlayersService
{
    /// <summary>
    /// Вход по никнейму. Свободный никнейм — создаётся гость и выдаётся токен.
    /// Занятый — вход только если <paramref name="currentPlayerId"/> (из токена) принадлежит его владельцу.
    /// </summary>
    Task<AppResult<EnterResultModel>> Enter(EnterForm form, Guid? currentPlayerId);

    Task<AppResult<PlayerProfileModel>> GetProfile(Guid playerId);

    /// <summary>Id игрока по гостевому токену или null, если токен неизвестен.</summary>
    Task<Guid?> GetIdByGuestToken(string guestToken);
}
