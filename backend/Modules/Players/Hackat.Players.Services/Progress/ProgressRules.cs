using System.Text;
using System.Text.Json;
using Hackat.Common.Result;
using Hackat.Common.Result.ErrorCodes;
using Hackat.Players.Contracts.Professions;
using Hackat.Players.Contracts.Progress;

namespace Hackat.Players.Services.Progress;

/// <summary>Проверки прогресса — общие для сохранения с сервера и переноса из браузера.</summary>
internal static class ProgressRules
{
    public static AppError? ValidateState(JsonElement? state)
    {
        if (state is not { } value || value.ValueKind == JsonValueKind.Null)
            return null;

        if (value.ValueKind != JsonValueKind.Object)
            return AppError.FromCode(AppErrorCodes.InvalidForm, "State должен быть JSON-объектом");

        if (Encoding.UTF8.GetByteCount(value.GetRawText()) > SaveProgressForm.MaxStateBytes)
            return AppError.FromCode(AppErrorCodes.InvalidForm, "State слишком большой (максимум 32 КБ)");

        return null;
    }

    /// <summary>Прогресс гостя из localStorage: известные профессии, без повторов, корректный State.</summary>
    public static AppError? ValidateLocal(LocalProgressForm[]? items)
    {
        if (items is null)
            return null;

        var duplicate = items.GroupBy(u => u.ProfessionCode, StringComparer.Ordinal).FirstOrDefault(g => g.Count() > 1);
        if (duplicate is not null)
            return AppError.FromCode(AppErrorCodes.InvalidForm, $"Профессия «{duplicate.Key}» передана несколько раз");

        foreach (var item in items)
        {
            if (!ProfessionCatalog.IsKnown(item.ProfessionCode))
                return AppError.FromCodeWithArgs(AppErrorCodes.UnknownProfession, item.ProfessionCode);

            if (ValidateState(item.State) is { } stateError)
                return stateError;
        }

        return null;
    }
}
