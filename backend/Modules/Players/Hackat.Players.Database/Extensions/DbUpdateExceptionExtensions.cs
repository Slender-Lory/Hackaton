using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Hackat.Players.Database.Extensions;

public static class DbUpdateExceptionExtensions
{
    /// <summary>Нарушение уникального индекса (гонка двух одновременных вставок).</summary>
    public static bool IsUniqueViolation(this DbUpdateException exception) =>
        exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation };
}
