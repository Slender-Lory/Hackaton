import {resolveTriage} from '@/core/utils/triage';

/** @typedef {import('@/core/types/shift').Shift} Shift */
/** @typedef {import('@/core/types/shift').ShiftState} ShiftState */
/** @typedef {import('@/core/types/shift').ChoiceOption} ChoiceOption */

const STRONG_SHARE = 0.8;
const GOOD_SHARE = 0.5;

/**
 * Итог главы: что получилось, что можно сделать лучше, и похвала.
 * @typedef {object} ChapterReview
 * @property {string[]} strengths
 * @property {string[]} growth
 * @property {string} praise
 */

/**
 * @param {ChoiceOption} option
 * @returns {number}
 */
function getOptionScore(option) {
    return (option.effects.pigHealth ?? 0) + (option.effects.reputation ?? 0);
}

/**
 * @param {number} share доля удачных решений
 * @returns {string}
 */
function getPraise(share) {
    if (share >= STRONG_SHARE) {
        return 'Отличная работа! Почти все решения — как у опытного ветеринара: внимательно, по порядку и с заботой о пациентах.';
    }

    if (share >= GOOD_SHARE) {
        return 'Хороший результат! Большинство решений точные, а там, где было сложно, теперь понятно, как поступить в следующий раз.';
    }

    return 'Первая глава позади, и это уже немало: ветеринары учатся годами. Посмотри, что можно сделать иначе, и попробуй ещё раз.';
}

/**
 * Разбирает ответы главы: выборы, обследования и очередь в приёмной.
 * @param {readonly Shift[]} chapter
 * @param {ShiftState} state
 * @returns {ChapterReview}
 */
export function getChapterReview(chapter, state) {
    const strengths = [];
    const growth = [];

    chapter
        .flatMap((shift) => shift.activities)
        .forEach((activity) => {
            const answers = state.answers[activity.code] ?? {};

            if (activity.kind === 'triage' && answers.triage?.outcomeId) {
                const {flags} = resolveTriage(answers.triage);
                (flags.correctPriority ? strengths : growth).push(
                    flags.correctPriority
                        ? 'Очередь в приёмной — самых срочных приняли первыми'
                        : 'Очередь в приёмной — срочным пациентам пришлось ждать',
                );

                return;
            }

            activity.steps.forEach((step) => {
                const answer = answers[step.id];

                if (answer === undefined) {
                    return;
                }

                if (step.kind === 'choice') {
                    const best = step.options.reduce((top, option) =>
                        getOptionScore(option) > getOptionScore(top) ? option : top,
                    );

                    const chosen = step.options.find((option) => option.id === answer);

                    if (chosen && getOptionScore(chosen) >= getOptionScore(best)) {
                        strengths.push(`${step.title} — ${best.label.toLowerCase()}`);
                    } else {
                        growth.push(`${step.title} — лучше сработало бы «${best.label}»`);
                    }
                }

                if (step.kind === 'checklist' && Array.isArray(answer)) {
                    const isMissed = step.options.some((option) => option.isNeeded && !answer.includes(option.id));
                    const isExtra = step.options.some((option) => !option.isNeeded && answer.includes(option.id));

                    if (!isMissed && !isExtra) {
                        strengths.push(`${step.title} — ровно то, что нужно`);
                    }

                    if (isMissed) {
                        growth.push(`${step.title} — не всё важное проверено`);
                    }

                    if (isExtra) {
                        growth.push(`${step.title} — часть процедур можно было не делать`);
                    }
                }
            });
        });

    const total = strengths.length + growth.length;

    return {strengths, growth, praise: getPraise(total ? strengths.length / total : 1)};
}
