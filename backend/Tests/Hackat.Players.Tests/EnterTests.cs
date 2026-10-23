using System.Net;
using Hackat.Common.Result.ErrorCodes;
using Hackat.Players.Tests.Infrastructure;

namespace Hackat.Players.Tests;

/// <summary>Игра без регистрации: гость по никнейму.</summary>
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
    public async Task Enter_CreatesGuestWithNonExpiringSession()
    {
        var nickname = PlayersApi.UniqueNickname();

        var response = await _api.Enter($"  {nickname}  ");

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        var result = response.Body.Result!;
        Assert.That(result.Player.Nickname, Is.EqualTo(nickname), "пробелы по краям обрезаются");
        Assert.That(result.Player.IsRegistered, Is.False);
        Assert.That(result.Player.Email, Is.Null);
        Assert.That(result.Token, Has.Length.GreaterThanOrEqualTo(40));
        Assert.That(result.ExpiresAt, Is.Null, "сессия гостя бессрочная");
    }

    [Test]
    public async Task SameNickname_CreatesDifferentGuests()
    {
        var nickname = "Вася " + Guid.NewGuid().ToString("N")[..6];

        var first = await _api.Enter(nickname);
        var second = await _api.Enter(nickname.ToUpperInvariant());

        Assert.That(first.Status, Is.EqualTo(HttpStatusCode.OK), first.Raw);
        Assert.That(second.Status, Is.EqualTo(HttpStatusCode.OK), second.Raw);
        Assert.That(second.Body.Result!.Player.Id, Is.Not.EqualTo(first.Body.Result!.Player.Id));
    }

    [Test]
    public async Task GuestToken_OpensProfile()
    {
        var (guest, token) = await _api.NewGuest();

        var me = await _api.Me(token);

        Assert.That(me.Status, Is.EqualTo(HttpStatusCode.OK), me.Raw);
        Assert.That(me.Body.Result!.Player.Id, Is.EqualTo(guest.Player.Id));
    }

    [Test]
    public async Task LegacyGuestPrefix_IsAccepted()
    {
        var (guest, token) = await _api.NewGuest();
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/players/me");
        request.Headers.TryAddWithoutValidation("Authorization", $"Guest {token}");

        using var response = await _client.SendAsync(request);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(await response.Content.ReadAsStringAsync(), Does.Contain(guest.Player.Id.ToString()));
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
    public async Task GuestLogout_RevokesToken()
    {
        var (_, token) = await _api.NewGuest();

        var logout = await _api.Logout(token);
        var me = await _api.Me(token);

        Assert.That(logout.Status, Is.EqualTo(HttpStatusCode.OK), logout.Raw);
        Assert.That(me.Status, Is.EqualTo(HttpStatusCode.Unauthorized), me.Raw);
    }
}
