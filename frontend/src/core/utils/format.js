const rublesFormat = new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 0});
const dateFormat = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'long', year: 'numeric'});
const yearPlural = new Intl.PluralRules('ru-RU');

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const YEAR_WORDS = Object.freeze({one: 'год', few: 'года', many: 'лет', other: 'года'});

/**
 * @param {number} value
 * @returns {string}
 */
export function formatRubles(value) {
    return rublesFormat.format(value);
}

/**
 * @param {number} value
 * @param {(value: number) => string} [formatValue]
 * @returns {string}
 */
export function formatSigned(value, formatValue = String) {
    return `${value > 0 ? '+' : '−'}${formatValue(Math.abs(value))}`;
}

/**
 * «14 марта 2022 г.» для ISO-даты; остальное — как есть.
 * @param {string} value
 * @returns {string}
 */
export function formatDate(value) {
    return ISO_DATE_PATTERN.test(value) ? dateFormat.format(new Date(value)) : value;
}

/**
 * Полных лет на дату now: «4 года». Для не-ISO даты — пустая строка.
 * @param {string} birthDate
 * @param {Date} now
 * @returns {string}
 */
export function formatAge(birthDate, now) {
    if (!ISO_DATE_PATTERN.test(birthDate)) {
        return '';
    }

    const born = new Date(birthDate);
    const hasHadBirthday =
        now.getMonth() > born.getMonth() || (now.getMonth() === born.getMonth() && now.getDate() >= born.getDate());
    const years = now.getFullYear() - born.getFullYear() - (hasHadBirthday ? 0 : 1);

    return `${years} ${YEAR_WORDS[yearPlural.select(years)]}`;
}
