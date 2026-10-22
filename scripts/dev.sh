#!/usr/bin/env bash
# Dev-скрипт: создаёт .env (если нет) и поднимает стек в Docker.
# Удобная альтернатива: make dev
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

cp -n .env.example .env || true
echo "[dev] .env готов. Поднимаю стек..."
exec docker compose --env-file .env up --build
