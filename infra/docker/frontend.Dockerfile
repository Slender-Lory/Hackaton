# ═══════════════════════════════════════════════════════════════════
#  Frontend: сборка Vite (node) → раздача статики через nginx.
#  Контекст сборки — корень репозитория:
#    docker build -f infra/docker/frontend.Dockerfile \
#      --build-arg VITE_API_URL=/api -t frontend .
#  nginx: SPA fallback + прокси /api → backend (см. infra/nginx/nginx.conf)
# ═══════════════════════════════════════════════════════════════════
FROM node:20-alpine AS build
WORKDIR /app

# Сначала package-файлы — слой кэшируется, пока зависимости не менялись
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ── Рантайм: nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine
COPY infra/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
