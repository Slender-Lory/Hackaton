using System.Net;
using Hackat.Common.Result.ErrorCodes;
using Hackat.Players.Contracts.Professions;
using Hackat.Players.Tests.Infrastructure;

namespace Hackat.Players.Tests;

/// <summary>
/// Регистрация и вход по почте, перенос прогресса гостя из браузера, сессии на устройствах, удаление аккаунта.
/// Гость на сервер не ходит: его прогресс приходит в поле progress при регистрации/входе.
/// </summary>
public sealed class AccountTests
{
    private const string Vet = ProfessionCatalog.Veterinarian;

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

    private static object LocalVetProgress(int level, int percent, string scene = "farm-day-2") => new
    {
        professionCode = Vet,
        level,
        percent,
        difficulty = "Hard",
        state = new { day = level, scene, counters = new { revenue = 120, reputation = 15, pigHealth = 60 } },
    };

    [Test]
    public async Task Register_CreatesAccountWithSessionFor30Days()
    {
        var email = PlayersApi.UniqueEmail();

        var response = await _api.Register($"  {email.ToUpperInvariant()} ", nickname: "  Доктор   Айболит ");

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        var result = response.Body.Result!;
        Assert.That(result.Player.Nickname, Is.EqualTo("Доктор Айболит"));
        Assert.That(result.Player.Email, Is.EqualTo(email.ToUpperInvariant()));
        Assert.That(result.ExpiresAt, Is.EqualTo(DateTimeOffset.UtcNow.AddDays(30)).Within(TimeSpan.FromMinutes(1)));
        Assert.That(result.ImportedProfessions, Is.Empty);
        Assert.That((await _api.Me(result.Token)).Status, Is.EqualTo(HttpStatusCode.OK));
    }

    [Test]
    public async Task Register_WithGuestProgress_StartsFromIt()
    {
        var (account, _, token) = await _api.NewAccount([LocalVetProgress(level: 2, percent: 45)]);

        Assert.That(account.ImportedProfessions, Is.EquivalentTo(new[] { Vet }));
        var progress = (await _api.GetProgress(token, Vet)).Body.Result!;
        Assert.That(progress.Level, Is.EqualTo(2));
        Assert.That(progress.Percent, Is.EqualTo(45));
        Assert.That(progress.Revision, Is.EqualTo(1), "дальше сохраняем с expectedRevision = 1");
        Assert.That(progress.State!.Value.GetProperty("counters").GetProperty("pigHealth").GetInt32(), Is.EqualTo(60));
    }

    [Test]
    public async Task SameNickname_IsAllowedForDifferentAccounts()
    {
        var nickname = PlayersApi.UniqueNickname();

        var first = await _api.Register(PlayersApi.UniqueEmail(), nickname: nickname);
        var second = await _api.Register(PlayersApi.UniqueEmail(), nickname: nickname);

        Assert.That(first.Status, Is.EqualTo(HttpStatusCode.OK), first.Raw);
        Assert.That(second.Status, Is.EqualTo(HttpStatusCode.OK), second.Raw);
    }

    [Test]
    public async Task Register_TakenEmail_IsConflict()
    {
        var (_, email, _) = await _api.NewAccount();

        var response = await _api.Register($"  {email.ToUpperInvariant()} ");

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.Conflict), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.EmailTaken));
    }

    [TestCase("not-an-email", PlayersApi.DefaultPassword, "Игрок")]
    [TestCase("ok@example.com", "short", "Игрок")]
    [TestCase("ok@example.com", PlayersApi.DefaultPassword, "a")]
    [TestCase("ok@example.com", PlayersApi.DefaultPassword, "<script>")]
    public async Task Register_InvalidForm_IsRejected(string email, string password, string nickname)
    {
        var response = await _api.Register(email, password, nickname);

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.BadRequest), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.InvalidForm));
    }

    [Test]
    public async Task Register_InvalidGuestProgress_IsRejectedAndNothingCreated()
    {
        var email = PlayersApi.UniqueEmail();

        var unknown = await _api.Register(email, progress: [new { professionCode = "astronaut", level = 1, percent = 1 }]);
        var duplicate = await _api.Register(email, progress: [LocalVetProgress(1, 10), LocalVetProgress(2, 20)]);
        var badState = await _api.Register(email, progress: [new { professionCode = Vet, level = 1, percent = 1, state = new[] { 1 } }]);
        var badPercent = await _api.Register(email, progress: [new { professionCode = Vet, level = 1, percent = 150 }]);

        Assert.That(unknown.Body.Error!.Code, Is.EqualTo(AppErrorCodes.UnknownProfession), unknown.Raw);
        Assert.That(duplicate.Body.Error!.Code, Is.EqualTo(AppErrorCodes.InvalidForm), duplicate.Raw);
        Assert.That(badState.Body.Error!.Code, Is.EqualTo(AppErrorCodes.InvalidForm), badState.Raw);
        Assert.That(badPercent.Body.Error!.Code, Is.EqualTo(AppErrorCodes.InvalidForm), badPercent.Raw);
        Assert.That((await _api.Register(email)).Status, Is.EqualTo(HttpStatusCode.OK), "почта осталась свободной");
    }

    [Test]
    public async Task Login_WithCorrectPassword_GivesWorkingSession()
    {
        var (account, email, _) = await _api.NewAccount();

        var response = await _api.Login(email.ToUpperInvariant());

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        var me = await _api.Me(response.Body.Result!.Token);
        Assert.That(me.Body.Result!.Player.Id, Is.EqualTo(account.Player.Id));
    }

    [Test]
    public async Task Login_WrongPasswordOrUnknownEmail_GiveSameError()
    {
        var (_, email, _) = await _api.NewAccount();

        var wrongPassword = await _api.Login(email, "wrong-password");
        var unknownEmail = await _api.Login(PlayersApi.UniqueEmail());

        Assert.That(wrongPassword.Status, Is.EqualTo(HttpStatusCode.Unauthorized), wrongPassword.Raw);
        Assert.That(unknownEmail.Status, Is.EqualTo(HttpStatusCode.Unauthorized), unknownEmail.Raw);
        Assert.That(wrongPassword.Body.Error!.Code, Is.EqualTo(AppErrorCodes.WrongEmailOrPassword));
        Assert.That(unknownEmail.Body.Error!.Message, Is.EqualTo(wrongPassword.Body.Error.Message));
    }

    [Test]
    public async Task Login_WithGuestProgress_ImportsIntoNotStartedProfession()
    {
        var (_, email, _) = await _api.NewAccount();

        var response = await _api.Login(email, progress: [LocalVetProgress(level: 3, percent: 70)]);

        var result = response.Body.Result!;
        Assert.That(result.ImportedProfessions, Is.EquivalentTo(new[] { Vet }), response.Raw);
        Assert.That(result.SkippedProfessions, Is.Empty);
        Assert.That((await _api.GetProgress(result.Token, Vet)).Body.Result!.Percent, Is.EqualTo(70));
    }

    [Test]
    public async Task Login_WithGuestProgress_KeepsAccountProgressWhenStarted()
    {
        var (_, email, token) = await _api.NewAccount();
        await _api.SaveProgress(token, Vet, new { level = 3, percent = 80, expectedRevision = 0 });

        var response = await _api.Login(email, progress: [LocalVetProgress(level: 1, percent: 10)]);

        var result = response.Body.Result!;
        Assert.That(result.ImportedProfessions, Is.Empty, response.Raw);
        Assert.That(result.SkippedProfessions, Is.EquivalentTo(new[] { Vet }));
        Assert.That((await _api.GetProgress(result.Token, Vet)).Body.Result!.Percent, Is.EqualTo(80));
    }

    [Test]
    public async Task ProgressFromOtherDevice_IsReturnedOnLogin()
    {
        var (_, email, firstDevice) = await _api.NewAccount();
        await _api.SaveProgress(firstDevice, Vet, new { level = 2, percent = 50, state = new { day = 2 }, expectedRevision = 0 });

        var secondDevice = (await _api.Login(email)).Body.Result!.Token;
        var progress = (await _api.GetProgress(secondDevice, Vet)).Body.Result!;

        Assert.That(progress.Percent, Is.EqualTo(50));
        Assert.That(progress.State!.Value.GetProperty("day").GetInt32(), Is.EqualTo(2));
    }

    [Test]
    public async Task Logout_EndsOnlyThisDeviceSession()
    {
        var (_, email, firstDevice) = await _api.NewAccount();
        var secondDevice = (await _api.Login(email)).Body.Result!.Token;

        var logout = await _api.Logout(secondDevice);

        Assert.That(logout.Status, Is.EqualTo(HttpStatusCode.OK), logout.Raw);
        Assert.That((await _api.Me(secondDevice)).Status, Is.EqualTo(HttpStatusCode.Unauthorized));
        Assert.That((await _api.Me(firstDevice)).Status, Is.EqualTo(HttpStatusCode.OK));
    }

    [Test]
    public async Task DeleteAccount_WithWrongPassword_IsForbidden()
    {
        var (_, _, token) = await _api.NewAccount();

        var response = await _api.DeleteAccount(token, "wrong-password");

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.Forbidden), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.WrongPassword));
        Assert.That((await _api.Me(token)).Status, Is.EqualTo(HttpStatusCode.OK), "аккаунт на месте");
    }

    [Test]
    public async Task DeleteAccount_RemovesAccountProgressAndAllSessions()
    {
        var (_, email, firstDevice) = await _api.NewAccount([LocalVetProgress(1, 10)]);
        var secondDevice = (await _api.Login(email)).Body.Result!.Token;

        var response = await _api.DeleteAccount(firstDevice);

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        Assert.That((await _api.Me(firstDevice)).Status, Is.EqualTo(HttpStatusCode.Unauthorized));
        Assert.That((await _api.Me(secondDevice)).Status, Is.EqualTo(HttpStatusCode.Unauthorized));
        Assert.That((await _api.Login(email)).Status, Is.EqualTo(HttpStatusCode.Unauthorized), "войти больше нельзя");

        var again = await _api.Register(email);
        Assert.That(again.Status, Is.EqualTo(HttpStatusCode.OK), "почту можно занять заново");
        Assert.That((await _api.GetProgress(again.Body.Result!.Token, Vet)).Body.Result!.Revision, Is.Zero, "старый прогресс удалён");
    }

    [Test]
    public async Task Login_TooManyAttempts_IsRateLimited()
    {
        await using var factory = ApiFixture.CreateFactory(authRateLimitPerMinute: 10);
        using var client = factory.CreateClient();
        var api = new PlayersApi(client);

        var statuses = new List<HttpStatusCode>();
        for (var i = 0; i < 11; i++)
            statuses.Add((await api.Login(PlayersApi.UniqueEmail())).Status);

        Assert.That(statuses.Take(10), Is.All.EqualTo(HttpStatusCode.Unauthorized));
        Assert.That(statuses.Last(), Is.EqualTo(HttpStatusCode.TooManyRequests));
    }
}
