using Hackat.Common.Result;
using Hackat.Players.Contracts.Progress;

namespace Hackat.Players.Services.Progress;

public interface IProgressService
{
    /// <summary>Прогресс по всем профессиям каталога (не начатые — с Revision = 0).</summary>
    Task<ProgressModel[]> GetAll(Guid playerId);

    Task<AppResult<ProgressModel>> Get(Guid playerId, string professionCode);

    /// <summary>Сохраняет прогресс с проверкой ревизии (защита от затирания из другой вкладки).</summary>
    Task<AppResult<ProgressModel>> Save(Guid playerId, string professionCode, SaveProgressForm form);
}
