# Схема приложения: от входа до выхода

Путь игрока по ТЗ v2.0. Аккаунты и серверный прогресс реализованы в backend;
гостевой режим и игровые экраны — на фронтенде (Vue).

```mermaid
flowchart TD
    open([Игрок открыл сайт]) --> hasToken{Токен аккаунта<br/>в браузере?}

    hasToken -->|"есть"| auto[Автовход<br/>GET /players/me]
    auto -->|"200"| home
    auto -->|"401"| hasGuest

    hasToken -->|"нет"| hasGuest{Гость в<br/>localStorage?}
    hasGuest -->|"есть"| home
    hasGuest -->|"нет"| start{Как играть?}

    start -->|"без регистрации"| guest[Гость: никнейм<br/>в localStorage]
    start -->|"есть аккаунт"| login[Вход по почте<br/>POST /players/login]
    start -->|"новый аккаунт"| register[Регистрация<br/>POST /players/register]

    guest --> home
    login -->|"200"| home
    login -->|"401 неверная почта или пароль"| start
    register -->|"200"| home
    register -->|"409 почта занята"| start

    home[Главная<br/>профиль и выбор профессии] --> load[Загрузка прогресса<br/>аккаунт: GET /players/me/progress/vet<br/>гость: localStorage]

    load -->|"не начата"| newGame[Новая игра<br/>день 1, выбор сложности]
    load -->|"есть прогресс"| resume[Продолжить<br/>с места из state]

    newGame --> play
    resume --> play

    play[Игра: три дня на свиноферме<br/>пациенты, триаж, счётчики] --> save[Сохранение прогресса<br/>аккаунт: PUT /players/me/progress/vet<br/>гость: localStorage]

    save -->|"сохранено"| play
    save -->|"409 ProgressConflict"| reload[Перечитать прогресс<br/>с сервера]
    reload --> play

    home -->|"гость: сохранить прогресс"| upgrade[Регистрация с progress<br/>из localStorage]
    upgrade --> home

    play --> exit{Выход}
    exit -->|"в меню"| saveExit[Сохранить] --> home
    exit -->|"из аккаунта"| logout[POST /players/logout]
    logout --> open
    home -->|"удалить аккаунт"| remove[DELETE /players/me<br/>с паролем]
    remove --> open

    classDef account fill:#EEEDFE,stroke:#534AB7,color:#3C3489
    classDef game fill:#E1F5EE,stroke:#0F6E56,color:#085041
    classDef error fill:#FCEBEB,stroke:#A32D2D,color:#791F1F
    class auto,guest,login,register,upgrade,logout account
    class load,newGame,resume,play,save,saveExit game
    class reload,remove error
```

Все пути API — с префиксом `/api/v1`. Токен аккаунта передаётся в заголовке `Authorization: Player <token>`.

## Этапы

### 1. Вход
- **Токен аккаунта в браузере** — `GET /players/me`: `200` — сразу на главную; `401` — сессия истекла
  или аккаунт удалён, токен стираем.
- **Играть без регистрации** — только фронт: никнейм (не уникален) и прогресс в `localStorage`, на сервер ничего
  не уходит. Обновление страницы прогресс не сбрасывает. С другого устройства гость начинает заново —
  показываем подсказку «Зарегистрируйтесь, чтобы играть с любого устройства».
- **Вход по почте** — `POST /players/login { email, password }`. Ошибка одна на неверную почту и неверный пароль.
- **Регистрация** — `POST /players/register { email, password, nickname }`. Почта уникальна, пароль от 8 символов,
  без подтверждения почты и восстановления пароля.
- Успешный вход/регистрация возвращает `token` (сессия на 30 дней с последнего использования) — в `localStorage`.

### 2. Гость → аккаунт
- **«Сохранить прогресс»** — `POST /players/register` c `progress` из `localStorage`:
  аккаунт создаётся сразу с ним, регистрация не означает «начать заново».
- **«Уже есть аккаунт»** — `POST /players/login` c `progress`: прогресс переносится в профессии, не начатые
  в аккаунте (`importedProfessions`); где начаты — остаётся прогресс аккаунта (`skippedProfessions`).
- После успеха фронт стирает гостя из `localStorage`.

### 3. Главная и старт игры
- Главная: профиль (уровень и процент), кнопка профессии «Ветеринар», страница описания профессии.
- Прогресс: у аккаунта — `GET /players/me/progress/vet` (`revision: 0` — не начата), у гостя — `localStorage`.

### 4. Игра и сохранение
- Глава — три игровых дня на свиноферме, побочные пациенты, триаж; счётчики выручки, репутации и здоровья поросят
  хранятся в `state`.
- Сохранение в контрольных точках (после сцены, в конце дня, по кнопке). У аккаунта —
  `PUT /players/me/progress/vet` с `{ level, percent, difficulty, state, expectedRevision }`:
  - `200` — в ответе новая `revision`, её передаём в следующем сохранении;
  - `409 ProgressConflict` — игра открыта в другой вкладке: перечитываем прогресс и продолжаем с него.
- Удобно: `level` — номер игрового дня, `percent` — процент прохождения главы.

### 5. Выход и удаление
- **В меню** — сохранить и вернуться на главную.
- **Из аккаунта** — `POST /players/logout`: токен этого устройства перестаёт работать, другие устройства — нет.
- **Удалить аккаунт** — `DELETE /players/me { password }`: аккаунт, прогресс и сессии на всех устройствах.
- **Гость «выходит»**, очищая `localStorage` (фронт предупреждает, что прогресс пропадёт).

Администратор в этом пути не участвует: он отдельно смотрит аккаунты и их прогресс
(`/test/admin.html`, API `/api/v1/admin/*`). Гостей сервер не видит.
