using System.Text.Json.Serialization;

namespace Hackat.Players.Contracts.Progress;

/// <summary>Уровень сложности прохождения (задача со звёздочкой из кейса). В JSON — строкой: "Normal".</summary>
[JsonConverter(typeof(JsonStringEnumConverter<Difficulty>))]
public enum Difficulty
{
    Easy = 1,
    Normal = 2,
    Hard = 3,
}
