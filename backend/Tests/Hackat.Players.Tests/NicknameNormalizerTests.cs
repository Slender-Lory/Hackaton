using Hackat.Players.Services.Players;

namespace Hackat.Players.Tests;

public sealed class NicknameNormalizerTests
{
    [TestCase("  Вася  ", "Вася")]
    [TestCase("Вася   Пупкин", "Вася Пупкин")]
    public void ToDisplay_TrimsAndCollapsesSpaces(string input, string expected) =>
        Assert.That(NicknameNormalizer.ToDisplay(input), Is.EqualTo(expected));

    [Test]
    public void ToKey_IgnoresCase() =>
        Assert.That(NicknameNormalizer.ToKey("ВаСя_42"), Is.EqualTo(NicknameNormalizer.ToKey("вася_42")));

    [Test]
    public void ToKey_FoldsCompatibilityCharacters() =>
        // Полноширинные латинские буквы (U+FF21…) не должны давать «клон» никнейма.
        Assert.That(NicknameNormalizer.ToKey("ＶＡＳＹＡ"), Is.EqualTo(NicknameNormalizer.ToKey("vasya")));
}
