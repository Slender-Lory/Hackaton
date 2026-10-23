using System.Net;
using Hackat.Common.Result.ErrorCodes;
using Hackat.Players.Contracts.Professions;
using Hackat.Players.Tests.Infrastructure;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Hackat.Players.Tests;

/// <summary>Регистрация по почте, вход, сессии на нескольких устройствах, перенос прогресса гостя.</summary>
public sealed class AccountTests
{
    private const string Vet = ProfessionCatalog.Veterinarian;

    private WebApplicationFactory<Program> _factory = null!;
    private HttpClient _client = null!;
    private PlayersApi _api = null!;

    [SetUp]
    public void SetUp()
    {
        // Свой экземпляр API на тест: у регистрации и входа лимит 10 запросов в минуту с одного адреса.
        _factory = ApiFixture.CreateFactory();
        _client = _factory.CreateClient();
        _api = new PlayersApi(_client);
    }

    [TearDown]
    public async Task TearDown()
    {
        _client.Dispose();
        await _factory.DisposeAsync();
    }

    [Test]
    public async Task Register_Guest_BecomesAccountWithItsProgress()
    {
        var (guest, guestToken) = await _api.NewGuest();
        await _api.SaveProgress(guestToken, Vet, new { level = 2, percent = 30, expectedRevision = 0 });
        var email = PlayersApi.UniqueEmail();

        var response = await _api.Register(guestToken, email.ToUpperInvariant());

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        var result = response.Body.Result!;
        Assert.That(result.Player.Id, Is.EqualTo(guest.Player.Id), "это тот же игрок");
        Assert.That(result.Player.IsRegistered, Is.True);
        Assert.That(result.Player.Nickname, Is.EqualTo(guest.Player.Nickname));
        Assert.That(result.ExpiresAt, Is.Not.Null, "сессия аккаунта ограничена по времени");

        var progress = await _api.GetProgress(result.Token, Vet);
        Assert.That(progress.Body.Result!.Percent, Is.EqualTo(30));

        var oldToken = await _api.Me(guestToken);
        Assert.That(oldToken.Status, Is.EqualTo(HttpStatusCode.Unauthorized), "гостевой токен заменён новым");
    }

    [Test]
    public async Task Register_WithNewNickname_RenamesGuest()
    {
        var (_, guestToken) = await _api.NewGuest();

        var response = await _api.Register(guestToken, PlayersApi.UniqueEmail(), nickname: "Новое имя");

        Assert.That(response.Body.Result!.Player.Nickname, Is.EqualTo("Новое имя"), response.Raw);
    }

    [Test]
    public async Task Register_WithoutGuest_RequiresNickname()
    {
        var response = await _api.Register(token: null, PlayersApi.UniqueEmail());

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.BadRequest), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.InvalidForm));
    }

    [Test]
    public async Task Register_TakenEmail_IsConflict()
    {
        var (_, email, _) = await _api.NewAccount();
        var (_, guestToken) = await _api.NewGuest();

        var response = await _api.Register(guestToken, $"  {email.ToUpperInvariant()} ");

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.Conflict), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.EmailTaken));
    }

    [Test]
    public async Task Register_WhenAlreadyRegistered_IsConflict()
    {
        var (_, _, token) = await _api.NewAccount();

        var response = await _api.Register(token, PlayersApi.UniqueEmail());

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.Conflict), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.AlreadyRegistered));
    }

    [TestCase("not-an-email", PlayersApi.DefaultPassword)]
    [TestCase("ok@example.com", "short")]
    public async Task Register_InvalidForm_IsRejected(string email, string password)
    {
        var response = await _api.Register(token: null, email, password, nickname: "Игрок");

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.BadRequest), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.InvalidForm));
    }

    [Test]
    public async Task Login_WithCorrectPassword_GivesWorkingSession()
    {
        var (account, email, _) = await _api.NewAccount();

        var response = await _api.Login(token: null, email.ToUpperInvariant());

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        var me = await _api.Me(response.Body.Result!.Token);
        Assert.That(me.Body.Result!.Player.Id, Is.EqualTo(account.Player.Id));
        Assert.That(me.Body.Result.Player.Email, Is.EqualTo(email));
    }

    [Test]
    public async Task Login_WrongPasswordOrUnknownEmail_GiveSameError()
    {
        var (_, email, _) = await _api.NewAccount();

        var wrongPassword = await _api.Login(token: null, email, "wrong-password");
        var unknownEmail = await _api.Login(token: null, PlayersApi.UniqueEmail());

        Assert.That(wrongPassword.Status, Is.EqualTo(HttpStatusCode.Unauthorized), wrongPassword.Raw);
        Assert.That(unknownEmail.Status, Is.EqualTo(HttpStatusCode.Unauthorized), unknownEmail.Raw);
        Assert.That(wrongPassword.Body.Error!.Code, Is.EqualTo(AppErrorCodes.WrongEmailOrPassword));
        Assert.That(unknownEmail.Body.Error!.Message, Is.EqualTo(wrongPassword.Body.Error.Message));
    }

    [Test]
    public async Task TwoDevices_HaveIndependentSessions()
    {
        var (_, email, firstDevice) = await _api.NewAccount();
        var secondDevice = (await _api.Login(token: null, email)).Body.Result!.Token;

        await _api.Logout(secondDevice);

        Assert.That((await _api.Me(firstDevice)).Status, Is.EqualTo(HttpStatusCode.OK), "выход на одном устройстве не трогает другое");
        Assert.That((await _api.Me(secondDevice)).Status, Is.EqualTo(HttpStatusCode.Unauthorized));
    }

    [Test]
    public async Task Login_FromGuest_TransfersProgressOfNotStartedProfession_AndDeletesGuest()
    {
        var (_, email, _) = await _api.NewAccount();
        var (_, guestToken) = await _api.NewGuest();
        await _api.SaveProgress(guestToken, Vet, new { level = 3, percent = 55, expectedRevision = 0 });

        var response = await _api.Login(guestToken, email);

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        var result = response.Body.Result!;
        Assert.That(result.TransferredProfessions, Is.EquivalentTo(new[] { Vet }));
        Assert.That(result.DiscardedProfessions, Is.Empty);
        Assert.That((await _api.GetProgress(result.Token, Vet)).Body.Result!.Percent, Is.EqualTo(55));
        Assert.That((await _api.Me(guestToken)).Status, Is.EqualTo(HttpStatusCode.Unauthorized), "гость удалён");
    }

    [Test]
    public async Task Login_FromGuest_KeepsAccountProgress_WhenBothStarted()
    {
        var (_, email, accountToken) = await _api.NewAccount();
        await _api.SaveProgress(accountToken, Vet, new { level = 5, percent = 80, expectedRevision = 0 });
        var (_, guestToken) = await _api.NewGuest();
        await _api.SaveProgress(guestToken, Vet, new { level = 1, percent = 10, expectedRevision = 0 });

        var response = await _api.Login(guestToken, email);

        var result = response.Body.Result!;
        Assert.That(result.TransferredProfessions, Is.Empty, response.Raw);
        Assert.That(result.DiscardedProfessions, Is.EquivalentTo(new[] { Vet }));
        Assert.That((await _api.GetProgress(result.Token, Vet)).Body.Result!.Percent, Is.EqualTo(80));
    }

    [Test]
    public async Task Login_TooManyAttempts_IsRateLimited()
    {
        var statuses = new List<HttpStatusCode>();
        for (var i = 0; i < 11; i++)
            statuses.Add((await _api.Login(token: null, PlayersApi.UniqueEmail())).Status);

        Assert.That(statuses.Take(10), Is.All.EqualTo(HttpStatusCode.Unauthorized));
        Assert.That(statuses.Last(), Is.EqualTo(HttpStatusCode.TooManyRequests));
    }
}
