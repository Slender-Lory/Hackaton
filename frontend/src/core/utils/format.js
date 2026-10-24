const rublesFormat = new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 0});

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
