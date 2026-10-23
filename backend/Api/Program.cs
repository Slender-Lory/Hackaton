using System.Text.Json;
using Api.Auth;
using Api.Auth.Admin;
using Api.Common;
using Hackat.Common.Result.ErrorCodes;
using Hackat.Players.Database.Context;
using Hackat.Players.Database.Extensions;
using Hackat.Players.Services.Extensions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ════════════════════════════════════════════════════════════════════
//  Конфигурация. Источники (по убыванию приоритета):
//   1) переменные окружения       2) appsettings.{env}.json    3) appsettings.json
//  Явные вызовы ниже — для наглядности шаблона (defaults уже делают то же).
// ════════════════════════════════════════════════════════════════════
builder.Configuration
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// ── CORS: список источников через запятую (CORS_ORIGIN) ─────────────
var corsOrigins = (builder.Configuration["CORS_ORIGIN"] ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
var corsAllowCredentials = bool.TryParse(builder.Configuration["CORS_ALLOW_CREDENTIALS"], out var cc) && cc;

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
{
    if (corsOrigins.Length == 1 && corsOrigins[0] == "*")
    {
        p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    }
    else
    {
        p.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod();
        if (corsAllowCredentials) p.AllowCredentials();
    }
}));

// ── JSON: camelCase и регистронезависимый парсинг ───────────────────
builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    o.SerializerOptions.PropertyNameCaseInsensitive = true;
});

// ── Модули ───────────────────────────────────────────────────────────
builder.Services
    .AddPlayersDatabase(sp => DatabaseConnection.Resolve(sp.GetRequiredService<IConfiguration>()))
    .AddPlayersServices();

// ── Аутентификация ───────────────────────────────────────────────────
//  Player   — игрок (гость или аккаунт): Authorization: Player <token> (схема по умолчанию)
//  AdminJwt — администратор: Authorization: Bearer <jwt>, политика Admin
builder.Services
    .AddAuthentication(PlayerAuthenticationHandler.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, PlayerAuthenticationHandler>(PlayerAuthenticationHandler.SchemeName, null)
    .AddAdminJwt();
builder.Services.AddAuthorization();
builder.Services.AddAuthRateLimits();

// ── Контроллеры: ошибки валидации в том же формате, что и остальные ─
builder.Services
    .AddControllers()
    .ConfigureApiBehaviorOptions(o => o.InvalidModelStateResponseFactory = AppResultResponses.InvalidModelState);

// ── OpenAPI / Swagger ────────────────────────────────────────────────
var appName = builder.Configuration["APP_NAME"] ?? AssemblyName;
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o =>
{
    o.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = appName,
        Version = "v1",
        Description = "API, сгенерированное из шаблона",
    });

    var playerScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Description = "Токен игрока из enter / register / login. Значение: Player <token>",
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = PlayerAuthenticationHandler.SchemeName },
    };
    o.AddSecurityDefinition(PlayerAuthenticationHandler.SchemeName, playerScheme);
    o.AddSecurityRequirement(new OpenApiSecurityRequirement { [playerScheme] = [] });

    var adminScheme = new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Токен администратора из POST /api/v1/admin/login",
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = AdminAuthOptions.SchemeName },
    };
    o.AddSecurityDefinition(AdminAuthOptions.SchemeName, adminScheme);
    o.AddSecurityRequirement(new OpenApiSecurityRequirement { [adminScheme] = [] });
});

var app = builder.Build();

// ── Миграции БД при старте (Database__MigrateOnStartup=false — отключить) ─
if (app.Configuration.GetValue("Database:MigrateOnStartup", true))
{
    await using var scope = app.Services.CreateAsyncScope();
    await scope.ServiceProvider.GetRequiredService<PlayersDbContext>().Database.MigrateAsync();
}

// ── Pipeline ─────────────────────────────────────────────────────────
// Необработанное исключение → 500 в формате AppResult (детали — только в логах).
app.UseExceptionHandler(errorApp => errorApp.Run(context =>
    AppResultResponses.WriteError(context, AppErrorCodes.UnknownError)));

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Тестовое меню для проверки API без фронтенда: /test/ (wwwroot/test/index.html;
    // /test без слеша DefaultFiles сам перенаправит на /test/).
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapControllers();

// ── Эндпоинты ────────────────────────────────────────────────────────
// Liveness: процесс жив и отвечает.
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = appName }))
   .WithName("Health")
   .WithTags("ops");

// Readiness: процесс готов принимать трафик.
// Проверяется наличие обязательной конфигурации и доступность БД.
app.MapGet("/ready", async (PlayersDbContext db, CancellationToken ct) =>
{
    var problems = new List<string>();

    if (bool.TryParse(app.Configuration["REQUIRE_DATABASE_URL"], out var needDb)
        && needDb
        && string.IsNullOrWhiteSpace(app.Configuration["DATABASE_URL"]))
    {
        problems.Add("DATABASE_URL is not set");
    }

    if (!await db.Database.CanConnectAsync(ct))
    {
        problems.Add("Database is not reachable");
    }

    return problems.Count == 0
        ? Results.Ok(new { status = "ready", service = appName })
        : Results.Json(new { status = "not_ready", problems }, statusCode: StatusCodes.Status503ServiceUnavailable);
}).WithName("Ready")
  .WithTags("ops");

// Служебная информация о сборке.
app.MapGet("/api/v1/info", () => Results.Ok(new
{
    name = appName,
    version = AssemblyVersion,
    environment = app.Environment.EnvironmentName,
    date = DateTimeOffset.UtcNow,
})).WithName("Info")
  .WithTags("ops");

app.Run();

// Метаданные сборки для /api/v1/info
public partial class Program
{
    private static readonly string AssemblyName =
        System.Reflection.Assembly.GetEntryAssembly()?.GetName().Name ?? "api";

    private static readonly string AssemblyVersion =
        System.Reflection.Assembly.GetEntryAssembly()?.GetName().Version?.ToString(3) ?? "0.0.0";
}
