namespace Hackat.Common.Result;

/// <summary>Страница списка: элементы, общее количество и параметры страницы.</summary>
public sealed record PagedResult<T>(T[] Items, int Total, int Offset, int Count);
