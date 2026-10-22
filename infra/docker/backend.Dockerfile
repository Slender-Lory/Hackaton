# ═══════════════════════════════════════════════════════════════════
#  Backend: многоступенчатая сборка .NET API.
#  Контекст сборки — корень репозитория:
#    docker build -f infra/docker/backend.Dockerfile -t backend .
#  В рантайме: Debian slim + curl (для healthcheck) + non-root user.
# ═══════════════════════════════════════════════════════════════════
FROM mcr.microsoft.com/dotnet/sdk:net8.0 AS build
WORKDIR /src

# Копируем только то, что нужно для restore (улучшает кэширование слоёв)
COPY backend/ ./
RUN dotnet restore Backend.sln

# Публикация (--no-restore: пакеты уже восстановлены)
RUN dotnet publish Api/Api.csproj -c Release -o /out --no-restore -p:UseAppHost=false

# ── Рантайм ─────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:net8.0
# curl нужен для healthcheck в docker-compose
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Запуск от непривилегированного пользователя
RUN addgroup --system app && adduser --system --ingroup app app

WORKDIR /app
COPY --from=build /out ./
RUN chown -R app:app /app

USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "Api.dll"]
