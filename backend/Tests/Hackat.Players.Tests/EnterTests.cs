using System.Net;
using Hackat.Common.Result.ErrorCodes;
using Hackat.Players.Tests.Infrastructure;

namespace Hackat.Players.Tests;

public sealed class EnterTests
{
    private HttpClient _client = null!;
    private PlayersApi _api = null!;

    [SetUp]
    public void SetUp()
    {
        _client = ApiFixture.Factory.CreateClient();
        _api = new PlayersApi(_client);
    }

    [TearDown]
    public void TearDown() => _client.Dispose();

    [Test]
    public async Task NewNickname_CreatesGuestWithToken()
    {
        var nickname = PlayersApi.UniqueNickname();

        var response = await _api.Enter($"  {nickname}  ");

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        var result = response.Body.Result!;
        Assert.That(result.IsNew, Is.True);
        Assert.That(result.Player.Nickname, Is.EqualTo(nickname), "пробелы по краям обрезаются");
        Assert.That(result.GuestToken, Is.Not.Null.And.Length.GreaterThanOrEqualTo(40));
    }

    [Test]
    public async Task ExistingNickname_WithOwnersToken_ResumesSamePlayer()
    {
        var (created, token) = await _api.NewGuest();

        var response = await _api.Enter(created.Player.Nickname, token);

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        var result = response.Body.Result!;
        Assert.That(result.IsNew, Is.False);
        Assert.That(result.Player.Id, Is.EqualTo(created.Player.Id));
        Assert.That(result.GuestToken, Is.Null, "токен выдаётся только при создании");
    }

    [Test]
    public async Task ExistingNickname_WithoutToken_IsTaken()
    {
        var (created, _) = await _api.NewGuest();

        var response = await _api.Enter(created.Player.Nickname);

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.Conflict), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.NicknameTaken));
        Assert.That(response.Body.Error.Message, Does.Contain(created.Player.Nickname));
    }

    [Test]
    public async Task ExistingNickname_WithAnotherPlayersToken_IsTaken()
    {
        var (first, _) = await _api.NewGuest();
        var (_, secondToken) = await _api.NewGuest();

        var response = await _api.Enter(first.Player.Nickname, secondToken);

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.Conflict), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.NicknameTaken));
    }

    [Test]
    public async Task Nickname_IsCaseAndSpaceInsensitive()
    {
        var nickname = "Вася " + Guid.NewGuid().ToString("N")[..6];
        var created = await _api.Enter(nickname);
        Assert.That(created.Status, Is.EqualTo(HttpStatusCode.OK), created.Raw);

        var response = await _api.Enter("  " + nickname.ToUpperInvariant().Replace(" ", "   ") + " ");

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.Conflict), response.Raw);
    }

    [TestCase("")]
    [TestCase("a")]
    [TestCase("<script>")]
    [TestCase("слишком-длинный-никнейм-123")]
    public async Task InvalidNickname_ReturnsInvalidForm(string nickname)
    {
        var response = await _api.Enter(nickname);

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.BadRequest), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.InvalidForm));
    }

    [Test]
    public async Task ConcurrentEnter_WithSameNickname_CreatesOnlyOnePlayer()
    {
        var nickname = PlayersApi.UniqueNickname();

        var responses = await Task.WhenAll(Enumerable.Range(0, 8).Select(_ => _api.Enter(nickname)));

        Assert.That(responses.Count(r => r.Status == HttpStatusCode.OK), Is.EqualTo(1));
        Assert.That(responses.Count(r => r.Status == HttpStatusCode.Conflict), Is.EqualTo(7));
    }
}
