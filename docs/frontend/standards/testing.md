# Тесты (Vitest)

```bash
cd frontend
npm test            # один прогон
npm run test:watch  # в режиме наблюдения
```

## Где

Рядом с кодом: `nicknameValidation.js` → `nicknameValidation.test.js`. Отдельной папки `tests/` нет.

## Что тестируем

- Чистые функции `core/utils` (валидация) и `core/helpers` (разбор ошибок, хранилища).
- Сторы Pinia: действия и геттеры, с замоканным `core/api` (`vi.mock('@/core/api/players', …)`).
- Composables без DOM (`useStoryScenes`).
- Инварианты данных `core/data` (уникальные коды, доступные профессии).

## Как

- `describe` — по имени модуля, `it` — фраза о поведении: `'листает вперёд и не уходит за последнюю сцену'`.
- Arrange → Act → Assert, одно поведение на `it`.
- Сеть мокаем на уровне `core/api` или `fetch` (`vi.stubGlobal`), не внутри компонентов.
- `localStorage` подменяем через `vi.stubGlobal`; после теста — `vi.unstubAllGlobals()`, `vi.clearAllMocks()`.
- Pinia: `setActivePinia(createPinia())` в `beforeEach`.

## Правила

- Новые тесты можно добавлять без согласования.
- Менять существующий тест — только объяснив, почему и что меняется, и получив согласие команды.
- Не тестируем детали реализации (внутренние `ref`) и поведение сторонних библиотек.
