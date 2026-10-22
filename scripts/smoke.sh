#!/usr/bin/env bash
# Smoke-тест: проверяет, что API жив.
#   ./scripts/smoke.sh [URL]          (по умолчанию http://localhost:8080)
#   make smoke URL=http://localhost:8080
set -euo pipefail

URL="${1:-${URL:-http://localhost:8080}}"
TIMEOUT="${TIMEOUT:-60}"

echo "[smoke] проверяю ${URL}/health (таймаут ${TIMEOUT}s)..."
curl -fsS --retry 20 --retry-delay 3 --retry-all-errors --max-time "$TIMEOUT" "$URL/health"
echo
echo "[smoke] OK"
