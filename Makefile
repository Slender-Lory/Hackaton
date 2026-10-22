# ══════════════════════════════════════════════════════════════════
#  Единый таск-раннер шаблона.
#  make dev          — поднять весь стек в Docker (cp .env, build, up)
#  make up           — поднять стек (без пересборки)
#  make down         — остановить стек
#  make logs         — логи всех сервисов, --tail по умолчанию 100
#  make status       — список сервисов
#  make build        — сборка backend (dotnet) + frontend (npm)
#  make test         — тесты backend + frontend
#  make lint         — линт frontend
#  make smoke        — smoke-тест /health (URL=http://localhost:8080)
#  make clean        — удалить билд-артефакты
#  make scaffold     — сгенерировать новый проект из шаблона
#  make apply-env    — cp .env.example .env (не перезаписывает)
# ══════════════════════════════════════════════════════════════════
SHELL := /usr/bin/env bash
.DEFAULT_GOAL := help

ENV_FILE    := .env
COMPOSE     := docker compose
CURL        := curl
DOTNET      := dotnet
NPM         := npm

define ensure_env
	@test -f $(ENV_FILE) || { echo "[make] $(ENV_FILE) отсутствует, создаю из .env.example"; cp .env.example $(ENV_FILE); }
endef

.PHONY: help apply-env dev up down logs status ps build test lint smoke clean scaffold

help: ## Показать список команд
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

apply-env: ## Создать .env из шаблона (если его нет)
	cp -n .env.example .env || true
	@echo "[make] .env готов (существующий не тронут)"

dev: ## Запустить весь стек в Docker (build + up)
	$(call ensure_env)
	$(COMPOSE) up --build

up: ## Поднять стек без пересборки
	$(call ensure_env)
	$(COMPOSE) up -d

down: ## Остановить и удалить контейнеры (volume сохраняется)
	$(COMPOSE) down

logs: ## Логи сервисов (LOG_TAIL=200, SERVICE=backend)
	$(COMPOSE) logs --tail=$(or $(LOG_TAIL),100) -f $(SERVICE)

ps status: ## Статус сервисов
	$(COMPOSE) ps

build: ## Собрать backend и frontend (вне Docker)
	$(DOTNET) build backend/Backend.sln -c Release
	cd frontend && $(NPM) run build

test: ## Прогнать тесты backend и frontend
	$(DOTNET) test backend/Backend.sln -c Release
	cd frontend && $(NPM) test

lint: ## Линт frontend (ESLint)
	cd frontend && $(NPM) run lint

smoke: ## Smoke: проверить /health (URL=http://localhost:8080)
	@: "${URL:?передайте URL=... , например make smoke URL=http://localhost:8080}"
	$(CURL) -fsS --retry 10 --retry-delay 2 $(URL)/health
	@echo
	@echo "[make] smoke OK: $(URL)/health"

clean: ## Удалить артефакты сборок
	rm -rf backend/**/bin backend/**/obj frontend/dist
	@echo "[make] clean done"

scaffold: ## Сгенерировать проект из шаблона (./scaffold.sh --name myapp)
	./scaffold.sh
