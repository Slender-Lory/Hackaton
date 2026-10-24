/** @typedef {import('@/core/types/prologue').PrologueScene} PrologueScene */

/** @type {Readonly<Record<string, readonly PrologueScene[]>>} */
export const prologues = Object.freeze({
    vet: Object.freeze([
        {id: 'town', text: 'Маленький город. Сорок тысяч человек, одна больница и ни одной ветклиники.'},
        {id: 'baron', text: 'Однажды заболел Тоша, твой пёс. Перестал есть и почти не вставал.'},
        {id: 'road', text: 'Ближайший ветеринар был в двух часах езды. Вы ехали ночью и успели в последний момент.'},
        {id: 'decision', text: 'И в тот момент жизнь изменилась.'},
        {id: 'return', text: 'Прошло десять лет. Теперь ветеринар в этом городе — ты.'},
    ]),
});
