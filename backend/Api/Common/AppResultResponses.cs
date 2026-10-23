using Hackat.Common.Result;
using Hackat.Common.Result.ErrorCodes;
using Microsoft.AspNetCore.Mvc;

namespace Api.Common;

/// <summary>Ответы в формате AppResult вне контроллеров: невалидная форма, 401, необработанное исключение.</summary>
public static class AppResultResponses
{
    /// <summary>Замена стандартного ProblemDetails при невалидной модели — тот же формат, что у остальных ошибок.</summary>
    public static IActionResult InvalidModelState(ActionContext context)
    {
        var messages = context.ModelState.Values
            .SelectMany(u => u.Errors)
            .Select(u => string.IsNullOrWhiteSpace(u.ErrorMessage) ? "Некорректное значение" : u.ErrorMessage)
            .Distinct();

        var result = new AppResult(AppError.FromCode(AppErrorCodes.InvalidForm, string.Join("; ", messages)));
        return new ObjectResult(result) { StatusCode = AppErrorCodes.InvalidForm.ToHttpStatus() };
    }

    public static Task WriteError(HttpContext context, AppErrorCodes code)
    {
        context.Response.StatusCode = code.ToHttpStatus();
        return context.Response.WriteAsJsonAsync(new AppResult(AppError.FromCode(code)));
    }
}
