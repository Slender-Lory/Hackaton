using System.Net;
using System.Net.Http.Headers;
using Hackat.Common.Result.ErrorCodes;
using Hackat.Players.Contracts.Professions;
using Hackat.Players.Tests.Infrastructure;

namespace Hackat.Players.Tests;

public sealed class AdminTests
{
    private HttpClient _client = null!;
    private AdminApi _admin = null!;
    private PlayersApi _players = null!;

    private static string? _adminToken;

    [SetUp]
    public async Task SetUp()
    {
        _client = ApiFixture.Factory.CreateClient();
        _admin = new AdminApi(_client);
        _players = new PlayersApi(_client);
        // Один вход на все тесты класса: вход ограничен 10 попытками в минуту.
        _adminToken ??= await _admin.LoginAsAdmin();
    }

    [TearDown]
    public void TearDown() => _client.Dispose();

    private AuthenticationHeaderValue AdminAuth => AdminApi.Bearer(_adminToken!);

    [Test]
    public async Task Login_WithWrongPassword_IsRejected()
    {
        var response = await _admin.Login(ApiFixture.AdminLogin, "wrong-password");

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.Unauthorized), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.InvalidCredentials));
    }

    [Test]
    public async Task AdminEndpoints_WithoutToken_AreUnauthorized()
    {
        var response = await _admin.Players(auth: null);

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.Unauthorized), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.Unauthorized));
    }

    [Test]
    public async Task AdminEndpoints_WithGuestToken_AreUnauthorized()
    {
        var (_, guestToken) = await _players.NewGuest();

        var response = await _admin.Players(new AuthenticationHeaderValue("Guest", guestToken));

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.Unauthorized), response.Raw);
    }

    [Test]
    public async Task GuestEndpoints_WithAdminToken_AreUnauthorized()
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/players/me");
        request.Headers.Authorization = AdminAuth;

        using var response = await _client.SendAsync(request);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Unauthorized));
    }

    [Test]
    public async Task AdminEndpoints_WithForgedToken_AreUnauthorized()
    {
        var forged = _adminToken![..^4] + "AAAA";

        var response = await _admin.Stats(AdminApi.Bearer(forged));

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.Unauthorized), response.Raw);
    }

    [Test]
    public async Task Players_ShowsPlayerWithProgress_AndSearchFindsIt()
    {
        var (created, token) = await _players.NewGuest();
        await _players.SaveProgress(token, ProfessionCatalog.Veterinarian, new { level = 2, percent = 40, expectedRevision = 0 });

        var response = await _admin.Players(AdminAuth, search: created.Player.Nickname.ToUpperInvariant());

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        var page = response.Body.Result!;
        Assert.That(page.Total, Is.EqualTo(1));
        var item = page.Items.Single();
        Assert.That(item.Id, Is.EqualTo(created.Player.Id));
        var vet = item.Progress.Single();
        Assert.That(vet.ProfessionCode, Is.EqualTo(ProfessionCatalog.Veterinarian));
        Assert.That(vet.Percent, Is.EqualTo(40));
    }

    [Test]
    public async Task Players_SearchByEmail_FindsRegisteredPlayer()
    {
        var (account, email, _) = await _players.NewAccount();

        var response = await _admin.Players(AdminAuth, search: email[..20].ToUpperInvariant());

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        var item = response.Body.Result!.Items.Single();
        Assert.That(item.Id, Is.EqualTo(account.Player.Id));
        Assert.That(item.IsRegistered, Is.True);
        Assert.That(item.Email, Is.EqualTo(email));
        Assert.That(item.RegisteredAt, Is.Not.Null);
    }

    [Test]
    public async Task Players_KindFilter_SeparatesGuestsAndAccounts()
    {
        var (guest, _) = await _players.NewGuest();
        var (account, _, _) = await _players.NewAccount();

        var guests = (await _admin.Players(AdminAuth, kind: "Guests", count: 100)).Body.Result!.Items;
        var registered = (await _admin.Players(AdminAuth, kind: "Registered", count: 100)).Body.Result!.Items;

        Assert.That(guests.Select(u => u.Id), Does.Contain(guest.Player.Id).And.Not.Contain(account.Player.Id));
        Assert.That(registered.Select(u => u.Id), Does.Contain(account.Player.Id).And.Not.Contain(guest.Player.Id));
        Assert.That(guests, Has.All.Matches<Hackat.Players.Contracts.Admin.AdminPlayerListItemModel>(u => !u.IsRegistered));
    }

    [Test]
    public async Task Players_Paging_RespectsCount()
    {
        await _players.NewGuest();
        await _players.NewGuest();

        var response = await _admin.Players(AdminAuth, count: 1);

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        Assert.That(response.Body.Result!.Items, Has.Length.EqualTo(1));
        Assert.That(response.Body.Result.Total, Is.GreaterThanOrEqualTo(2));
    }

    [Test]
    public async Task PlayerDetails_IncludeState()
    {
        var (created, token) = await _players.NewGuest();
        await _players.SaveProgress(token, ProfessionCatalog.Veterinarian,
            new { level = 1, percent = 10, state = new { scene = "farm" }, expectedRevision = 0 });

        var response = await _admin.Player(AdminAuth, created.Player.Id);

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        var vet = response.Body.Result!.Progress.Single(u => u.ProfessionCode == ProfessionCatalog.Veterinarian);
        Assert.That(vet.State!.Value.GetProperty("scene").GetString(), Is.EqualTo("farm"));
    }

    [Test]
    public async Task PlayerDetails_UnknownId_IsNotFound()
    {
        var response = await _admin.Player(AdminAuth, Guid.NewGuid());

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.NotFound), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.PlayerNotFound));
    }

    [Test]
    public async Task Stats_CountNewPlayersAndProgress()
    {
        var before = (await _admin.Stats(AdminAuth)).Body.Result!;
        var (_, token) = await _players.NewGuest();
        await _players.SaveProgress(token, ProfessionCatalog.Veterinarian, new { level = 5, percent = 100, expectedRevision = 0 });
        await _players.NewAccount();

        var after = (await _admin.Stats(AdminAuth)).Body.Result!;

        // Тесты идут параллельно с другими классами, поэтому проверяем «не меньше».
        Assert.That(after.TotalPlayers, Is.GreaterThanOrEqualTo(before.TotalPlayers + 2));
        Assert.That(after.RegisteredPlayers, Is.GreaterThanOrEqualTo(before.RegisteredPlayers + 1));
        Assert.That(after.NewLast24Hours, Is.GreaterThanOrEqualTo(before.NewLast24Hours + 1));
        var vetBefore = before.Professions.Single(u => u.ProfessionCode == ProfessionCatalog.Veterinarian);
        var vetAfter = after.Professions.Single(u => u.ProfessionCode == ProfessionCatalog.Veterinarian);
        Assert.That(vetAfter.Started, Is.GreaterThanOrEqualTo(vetBefore.Started + 1));
        Assert.That(vetAfter.Completed, Is.GreaterThanOrEqualTo(vetBefore.Completed + 1));
    }

    [Test]
    public async Task Login_TooManyAttempts_IsRateLimited()
    {
        // Отдельный экземпляр API — чтобы не исчерпать лимит остальным тестам.
        await using var factory = ApiFixture.CreateFactory();
        using var client = factory.CreateClient();
        var admin = new AdminApi(client);

        var statuses = new List<HttpStatusCode>();
        for (var i = 0; i < 11; i++)
            statuses.Add((await admin.Login(ApiFixture.AdminLogin, "wrong-password")).Status);

        Assert.That(statuses.Take(10), Is.All.EqualTo(HttpStatusCode.Unauthorized));
        Assert.That(statuses.Last(), Is.EqualTo(HttpStatusCode.TooManyRequests));
    }
}
