using System.Text.Json;
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
});

var app = builder.Build();

// ── Pipeline ─────────────────────────────────────────────────────────
app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ── Эндпоинты ────────────────────────────────────────────────────────
// Liveness: процесс жив и отвечает.
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = appName }))
   .WithName("Health")
   .WithTags("ops");

// Readiness: процесс готов принимать трафик.
// По умолчанию проверяется только наличие обязательной конфигурации.
// Расширяйте: пинг БД, кэша, внешних сервисов и т.п.
app.MapGet("/ready", () =>
{
    var problems = new List<string>();

    if (bool.TryParse(app.Configuration["REQUIRE_DATABASE_URL"], out var needDb)
        && needDb
        && string.IsNullOrWhiteSpace(app.Configuration["DATABASE_URL"]))
    {
        problems.Add("DATABASE_URL is not set");
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
partial class Program
{
    private static readonly string AssemblyName =
        System.Reflection.Assembly.GetEntryAssembly()?.GetName().Name ?? "api";

    private static readonly string AssemblyVersion =
        System.Reflection.Assembly.GetEntryAssembly()?.GetName().Version?.ToString(3) ?? "0.0.0";
}
