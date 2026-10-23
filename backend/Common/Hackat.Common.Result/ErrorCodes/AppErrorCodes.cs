using System.ComponentModel;

namespace Hackat.Common.Result.ErrorCodes;

/// <summary>
/// Коды ошибок API. Код состоит из 8 цифр, первые 2 — префикс группы.
/// <see cref="DescriptionAttribute"/> — сообщение по умолчанию (показывается игроку),
/// <see cref="HttpStatusAttribute"/> — HTTP-статус ответа.
/// </summary>
public enum AppErrorCodes
{
    #region Common errors. Prefix 10

    [Description("Успех")]
    [HttpStatus(200)]
    Ok = 10000001,

    [Description("Неизвестная ошибка")]
    [HttpStatus(500)]
    UnknownError = 10000002,

    [Description("Некорректные данные формы")]
    [HttpStatus(400)]
    InvalidForm = 10000003,

    [Description("Требуется вход в игру")]
    [HttpStatus(401)]
    Unauthorized = 10000004,

    [Description("Недостаточно прав")]
    [HttpStatus(403)]
    Forbidden = 10000005,

    [Description("Слишком много попыток, повторите через минуту")]
    [HttpStatus(429)]
    TooManyRequests = 10000006,

    #endregion

    #region Players. Prefix 20

    [Description("Никнейм «{0}» уже занят")]
    [HttpStatus(409)]
    NicknameTaken = 20000001,

    [Description("Игрок не найден")]
    [HttpStatus(404)]
    PlayerNotFound = 20000002,

    #endregion

    #region Progress. Prefix 21

    [Description("Профессия «{0}» не найдена")]
    [HttpStatus(400)]
    UnknownProfession = 21000001,

    [Description("Прогресс был сохранён в другой вкладке или на другом устройстве. Загрузите актуальную версию")]
    [HttpStatus(409)]
    ProgressConflict = 21000002,

    #endregion

    #region Admin. Prefix 30

    [Description("Неверный логин или пароль")]
    [HttpStatus(401)]
    InvalidCredentials = 30000001,

    [Description("Вход администратора не настроен (ADMIN_PASSWORD)")]
    [HttpStatus(403)]
    AdminLoginDisabled = 30000002,

    #endregion
}
