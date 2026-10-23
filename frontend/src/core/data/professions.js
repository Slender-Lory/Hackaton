/** @typedef {import('@/core/types/profession').Profession} Profession */

/**
 * Профессии экрана выбора. Новая профессия = новая запись.
 * code совпадает с ProfessionCatalog на backend'е (там пока только vet).
 * @type {readonly Profession[]}
 */
export const professions = Object.freeze([
    {
        code: 'vet',
        title: 'Ветеринар',
        tagline: 'Лечи зверей и спасай ферму',
        icon: '🐾',
        isAvailable: true,
    },
    {
        code: 'agro',
        title: 'Агроном',
        tagline: 'Дрон, поле и урожай',
        icon: '🌾',
        isAvailable: false,
    },
    {
        code: 'zootech',
        title: 'Зоотехник',
        tagline: 'Здоровое стадо — твоя забота',
        icon: '🐄',
        isAvailable: false,
    },
    {
        code: 'drone',
        title: 'Оператор агродронов',
        tagline: 'Пилот над полями',
        icon: '🚁',
        isAvailable: false,
    },
    {
        code: 'eco',
        title: 'Эколог',
        tagline: 'Чистая река и степь',
        icon: '🌿',
        isAvailable: false,
    },
]);
