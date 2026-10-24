import {describe, expect, it} from 'vitest';
import {getChapterReview} from './review';

const CHAPTER = [
    {
        number: 1,
        activities: [
            {
                code: 'farm',
                steps: [
                    {
                        kind: 'choice',
                        id: 'approach',
                        title: 'С чего начнёшь?',
                        options: [
                            {id: 'isolate', label: 'Отделить больных', effects: {pigHealth: 5}},
                            {id: 'all', label: 'Осмотреть всех', effects: {pigHealth: -5}},
                        ],
                    },
                    {
                        kind: 'checklist',
                        id: 'tests',
                        title: 'Анализы',
                        options: [
                            {id: 'lamp', isNeeded: true},
                            {id: 'xray', isNeeded: false},
                        ],
                    },
                ],
            },
        ],
    },
];

/**
 * @param {Record<string, unknown>} answers
 */
function makeState(answers) {
    return {answers: {farm: answers}};
}

describe('getChapterReview', () => {
    it('хвалит за лучшие решения', () => {
        const review = getChapterReview(CHAPTER, makeState({approach: 'isolate', tests: ['lamp']}));

        expect(review.strengths).toHaveLength(2);
        expect(review.growth).toEqual([]);
        expect(review.praise).toMatch(/^Отличная работа/);
    });

    it('спокойно подсказывает, что можно сделать лучше', () => {
        const review = getChapterReview(CHAPTER, makeState({approach: 'all', tests: ['xray']}));

        expect(review.growth).toEqual([
            'С чего начнёшь? — лучше сработало бы «Отделить больных»',
            'Анализы — не всё нужное сделано',
            'Анализы — часть процедур можно было не делать',
        ]);
        expect(review.praise).toMatch(/^Первая глава позади/);
    });
});
