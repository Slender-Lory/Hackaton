-- Идемпотентная инициализация БД.
-- Выполняется PostgreSQL при первом старте volume pgdata
-- (каталог /docker-entrypoint-initdb.d контейнера db).
CREATE TABLE IF NOT EXISTS service_meta (
    id BIGSERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO service_meta (key, value)
VALUES ('schema_version', '1') ON CONFLICT (key) DO NOTHING;
