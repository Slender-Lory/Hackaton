/**
 * Характеристика на карте профессии: «Смены — 3».
 * @typedef {object} ProfessionStat
 * @property {'calendar' | 'clock' | 'paw'} icon
 * @property {string} label
 * @property {string} value
 */

/**
 * Пациент на арте карты: 3D-модель из public/models (источники — CREDITS.md).
 * @typedef {object} ProfessionPatient
 * @property {string} name
 * @property {'dog' | 'cat' | 'bird' | 'pig'} kind кого рисует 2D-иллюстрация
 */

/**
 * Профессия — карта в колоде.
 * @typedef {object} Profession
 * @property {string} code совпадает с ProfessionCatalog на backend'е; цвет — var(--profession-<code>)
 * @property {string} title
 * @property {string} kind тип карты: сфера профессии
 * @property {ProfessionPatient} [patient] у закрытых карт пациента нет
 * @property {string} tagline одна строка: подростки длинное не читают
 * @property {ProfessionStat[]} stats
 * @property {boolean} isAvailable false — карта лежит рубашкой вверх
 */

/**
 * Страница о профессии: что делает, зачем, как стать.
 * @typedef {object} ProfessionInfo
 * @property {string} title
 * @property {string} lead
 * @property {{id: string, title: string, items: string[]}[]} sections
 */

export {};
