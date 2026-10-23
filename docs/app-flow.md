# Схема приложения: от входа до выхода

Путь игрока в общих чертах. Вход и прогресс реализованы в backend (ветка `add-test-menu`),
игровые экраны — предлагаемая логика для фронтенда (Vue).

```mermaid
flowchart TD
    open([Игрок открыл сайт]) --> hasToken{Токен в браузере?}

    hasToken -->|"нет"| enter[Вход по никнейму<br/>POST /api/v1/players/enter]
    hasToken -->|"есть"| auto[Автовход<br/>GET /api/v1/players/me]

    enter -->|"новый ник"| created[Создан гость<br/>guestToken → localStorage]
    enter -->|"свой ник + токен"| home
    enter -->|"чужой ник"| taken[409 NicknameTaken<br/>выбрать другой ник]
    taken --> enter
    created --> home

    auto -->|"200"| home
    auto -->|"401"| enter

    home[Главная<br/>профиль и выбор профессии] --> load[Загрузка прогресса<br/>GET /api/v1/players/me/progress/vet]

    load -->|"revision = 0"| newGame[Новая игра<br/>день 1, выбор сложности]
    load -->|"revision > 0"| resume[Продолжить<br/>с места из state]

    newGame --> play
    resume --> play

    play[Игра: рабочие дни<br/>пациенты, диалоги, решения] --> save[Сохранение прогресса<br/>PUT /api/v1/players/me/progress/vet]

    save -->|"200, новая revision"| play
    save -->|"409 ProgressConflict"| reload[Перечитать прогресс<br/>с сервера]
    reload --> play

    play --> exit{Выход}
    exit -->|"в меню"| saveExit[Сохранить] --> home
    exit -->|"из аккаунта"| logout[Забыть текущего игрока<br/>токен остаётся в браузере]
    logout --> open

    classDef account fill:#EEEDFE,stroke:#534AB7,color:#3C3489
    classDef game fill:#E1F5EE,stroke:#0F6E56,color:#085041
    classDef error fill:#FCEBEB,stroke:#A32D2D,color:#791F1F
    class enter,auto,created,logout account
    class load,newGame,resume,play,save,saveExit,reload game
    class taken error
```

## Этапы

### 1. Вход
- **Токена нет** — игрок вводит никнейм, `POST /api/v1/players/enter`:
  - свободный ник — создаётся гость, сервер один раз выдаёт `guestToken`, фронт кладёт его в `localStorage`;
  - свой ник (его токен есть в этом браузере) — вход в свой аккаунт;
  - чужой ник — `409 NicknameTaken`, нужен другой.
- **Токен есть** — `GET /api/v1/players/me` с заголовком `Authorization: Guest <token>`:
  `200` — сразу на главную, `401` — токен недействителен, показываем форму входа.

### 2. Главная и старт игры
- Главная: профиль (уровень и процент по профессии) и кнопка профессии «Ветеринар».
- `GET /api/v1/players/me/progress/vet`:
  - `revision: 0` — профессия не начата: новая игра с первого дня, выбор сложности;
  - `revision > 0` — продолжение с места из `state` (день, сцена, флаги диалогов).

### 3. Игра и сохранение
- Рабочие дни: пациенты и хозяева, диалоги, выбор лечения.
- Сохранение в контрольных точках (после сцены, в конце дня, по кнопке):
  `PUT /api/v1/players/me/progress/vet` с `{ level, percent, difficulty, state, expectedRevision }`.
  - `200` — в ответе новая `revision`, её передаём в следующем сохранении;
  - `409 ProgressConflict` — игра открыта в другой вкладке: перечитываем прогресс и продолжаем с него.

### 4. Выход
- **В меню** — сохранить и вернуться на главную (там виден обновлённый процент).
- **Из аккаунта** — забыть текущего игрока; токен остаётся в `localStorage`,
  поэтому вернуться по тому же нику с этого браузера можно.
- **Закрыл вкладку** — на сервере остаётся прогресс последнего сохранения.

Администратор в этом пути не участвует: он отдельно смотрит всех игроков и их прогресс
(`/test/admin.html`, API `/api/v1/admin/*`).
