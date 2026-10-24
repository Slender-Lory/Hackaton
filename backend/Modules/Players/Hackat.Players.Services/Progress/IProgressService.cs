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

    /// <summary>
    /// Переносит прогресс гостя из браузера (уже проверенный <see cref="ProgressRules.ValidateLocal"/>):
    /// только профессии, не начатые в аккаунте. Imported — перенесённые, Skipped — где остался прогресс аккаунта.
    /// </summary>
    Task<(string[] Imported, string[] Skipped)> ImportLocal(Guid playerId, LocalProgressForm[]? items);
}
