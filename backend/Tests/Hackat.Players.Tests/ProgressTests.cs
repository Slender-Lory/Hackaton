using System.Net;
using Hackat.Common.Result.ErrorCodes;
using Hackat.Players.Contracts.Professions;
using Hackat.Players.Contracts.Progress;
using Hackat.Players.Tests.Infrastructure;

namespace Hackat.Players.Tests;

public sealed class ProgressTests
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

    [Test]
    public async Task Me_WithoutToken_IsUnauthorized()
    {
        var response = await _api.Me(token: null);

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.Unauthorized), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.Unauthorized));
    }

    [Test]
    public async Task Me_WithUnknownToken_IsUnauthorized()
    {
        var response = await _api.Me("not-a-real-token");

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.Unauthorized), response.Raw);
    }

    [Test]
    public async Task Me_NewPlayer_HasNotStartedProgressForEveryProfession()
    {
        var (created, token) = await _api.NewGuest();

        var response = await _api.Me(token);

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.OK), response.Raw);
        var profile = response.Body.Result!;
        Assert.That(profile.Player.Id, Is.EqualTo(created.Player.Id));
        var vet = profile.Progress.Single(u => u.ProfessionCode == Vet);
        Assert.That(vet.ProfessionTitle, Is.EqualTo("Ветеринар"));
        Assert.That(vet.Revision, Is.Zero);
        Assert.That(vet.UpdatedAt, Is.Null);
    }

    [Test]
    public async Task Save_ThenRead_ReturnsSavedProgressAndState()
    {
        var (_, token) = await _api.NewGuest();

        var saved = await _api.SaveProgress(token, Vet, new
        {
            level = 2,
            percent = 35,
            difficulty = "Hard",
            state = new { day = 2, scene = "farm", flags = new { metOwner = true } },
            expectedRevision = 0,
        });

        Assert.That(saved.Status, Is.EqualTo(HttpStatusCode.OK), saved.Raw);
        Assert.That(saved.Body.Result!.Revision, Is.EqualTo(1));

        var read = await _api.GetProgress(token, Vet);
        var progress = read.Body.Result!;
        Assert.That(progress.Level, Is.EqualTo(2));
        Assert.That(progress.Percent, Is.EqualTo(35));
        Assert.That(progress.Difficulty, Is.EqualTo(Difficulty.Hard));
        Assert.That(progress.State!.Value.GetProperty("scene").GetString(), Is.EqualTo("farm"));
        Assert.That(progress.State.Value.GetProperty("flags").GetProperty("metOwner").GetBoolean(), Is.True);
    }

    [Test]
    public async Task Save_WithSequentialRevisions_Succeeds()
    {
        var (_, token) = await _api.NewGuest();

        var first = await _api.SaveProgress(token, Vet, new { level = 1, percent = 10, expectedRevision = 0 });
        var second = await _api.SaveProgress(token, Vet, new { level = 1, percent = 20, expectedRevision = 1 });

        Assert.That(first.Status, Is.EqualTo(HttpStatusCode.OK), first.Raw);
        Assert.That(second.Status, Is.EqualTo(HttpStatusCode.OK), second.Raw);
        Assert.That(second.Body.Result!.Revision, Is.EqualTo(2));
        Assert.That(second.Body.Result.Percent, Is.EqualTo(20));
    }

    [Test]
    public async Task Save_WithStaleRevision_IsConflict()
    {
        var (_, token) = await _api.NewGuest();
        await _api.SaveProgress(token, Vet, new { level = 1, percent = 10, expectedRevision = 0 });
        await _api.SaveProgress(token, Vet, new { level = 1, percent = 20, expectedRevision = 1 });

        // Вторая вкладка всё ещё думает, что ревизия 1.
        var stale = await _api.SaveProgress(token, Vet, new { level = 1, percent = 15, expectedRevision = 1 });

        Assert.That(stale.Status, Is.EqualTo(HttpStatusCode.Conflict), stale.Raw);
        Assert.That(stale.Body.Error!.Code, Is.EqualTo(AppErrorCodes.ProgressConflict));
        var current = await _api.GetProgress(token, Vet);
        Assert.That(current.Body.Result!.Percent, Is.EqualTo(20), "старые данные не затёрли новые");
    }

    [Test]
    public async Task Save_ProgressOfOnePlayer_IsInvisibleToAnother()
    {
        var (_, firstToken) = await _api.NewGuest();
        var (_, secondToken) = await _api.NewGuest();
        await _api.SaveProgress(firstToken, Vet, new { level = 3, percent = 50, expectedRevision = 0 });

        var other = await _api.GetProgress(secondToken, Vet);

        Assert.That(other.Body.Result!.Revision, Is.Zero);
    }

    [Test]
    public async Task Save_UnknownProfession_IsRejected()
    {
        var (_, token) = await _api.NewGuest();

        var response = await _api.SaveProgress(token, "astronaut", new { level = 1, percent = 1, expectedRevision = 0 });

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.BadRequest), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.UnknownProfession));
    }

    [Test]
    public async Task Save_PercentOutOfRange_IsInvalidForm()
    {
        var (_, token) = await _api.NewGuest();

        var response = await _api.SaveProgress(token, Vet, new { level = 1, percent = 150, expectedRevision = 0 });

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.BadRequest), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.InvalidForm));
    }

    [Test]
    public async Task Save_StateNotAnObject_IsInvalidForm()
    {
        var (_, token) = await _api.NewGuest();

        var response = await _api.SaveProgress(token, Vet, new { level = 1, percent = 1, state = new[] { 1, 2 }, expectedRevision = 0 });

        Assert.That(response.Status, Is.EqualTo(HttpStatusCode.BadRequest), response.Raw);
        Assert.That(response.Body.Error!.Code, Is.EqualTo(AppErrorCodes.InvalidForm));
    }
}
