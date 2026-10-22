#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  Универсальный deploy-скрипт поверх docker compose.
#
#  Использование:
#    ./infra/deploy/deploy.sh [команда] [опции]
#
#  Команды (по умолчанию: up):
#    up|deploy   — собрать и поднять стек (с ожиданием /health)
#    down        — остановить стек
#    restart     — перезапустить стек
#    logs        — логи сервисов (LOG_TAIL=200)
#    ps|status   — список сервисов
#    config|dry-run — показать итоговую конфигурацию compose
#    help        — справка
#
#  Опции:
#    --env-file PATH  — файл с переменными (по умолчанию корневой .env)
#    SERVICE          — фильтр сервиса для logs/restart (например: backend)
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/docker-compose.yml}"
ENV_FILE=""
CMD="up"
SERVICE=""
LOG_TAIL="${LOG_TAIL:-100}"

usage() {
  sed -n '2,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

# ── Разбор аргументов ──
while [[ $# -gt 0 ]]; do
  case "$1" in
    up|deploy)          CMD="up" ;;
    down)               CMD="down" ;;
    restart)            CMD="restart" ;;
    logs)               CMD="logs" ;;
    ps|status)          CMD="ps" ;;
    config|dry-run)     CMD="config" ;;
    help|-h|--help)     usage && exit 0 ;;
    --env-file)
      shift; [[ $# -ge 1 ]] || { echo "Ошибка: --env-file требует путь" >&2; exit 1; }
      ENV_FILE="$1"
      ;;
    --env-file=*)
      ENV_FILE="${1#*=}"
      ;;
    *)
      if [[ "$1" == -* ]]; then
        echo "Неизвестная опция: $1" >&2; usage >&2; exit 1
      fi
      SERVICE="$1"
      ;;
  esac
  shift
done

# ── .env: если явный не задан — берём корневой, при отсутствии создаём ──
if [[ -z "$ENV_FILE" ]]; then
  if [[ ! -f .env ]]; then
    echo "[deploy] .env не найден, создаю из .env.example (dev-значения)"
    cp .env.example .env
  fi
  ENV_FILE=".env"
fi

compose() { docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"; }

case "$CMD" in
  config)
    echo "[deploy] конфигурация compose (dry-run)"
    compose config
    ;;
  up)
    echo "[deploy] сборка и запуск стека"
    compose up -d --build "$SERVICE"

    # Ожидание /health (только если поднят backend)
    PORT="$(grep -E '^APP_PORT=' "$ENV_FILE" | cut -d= -f2 | sed 's/^"//;s/"$//')"
    PORT="${PORT:-8080}"
    echo "[deploy] ожидание http://localhost:${PORT}/health ..."
    for _ in $(seq 1 30); do
      if curl -fsS "http://localhost:${PORT}/health" >/dev/null 2>&1; then
        echo "[deploy] OK: API здоров"
        compose ps
        exit 0
      fi
      sleep 2
    done

    echo "[deploy] ошибка: /health не ответил за отведённое время" >&2
    compose logs backend >&2 || true
    exit 1
    ;;
  down)
    compose down
    ;;
  restart)
    compose restart "$SERVICE"
    ;;
  logs)
    compose logs --tail="$LOG_TAIL" -f "$SERVICE"
    ;;
  ps)
    compose ps
    ;;
esac
