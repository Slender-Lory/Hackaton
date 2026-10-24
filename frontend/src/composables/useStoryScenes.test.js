import {describe, expect, it} from 'vitest';
import {ref} from 'vue';
import {useStoryScenes} from './useStoryScenes';

const SCENES = [
    {id: 'first', text: 'Первая'},
    {id: 'second', text: 'Вторая'},
];

describe('useStoryScenes', () => {
    it('листает вперёд и не уходит за последнюю сцену', () => {
        const {currentScene, isLastScene, showNextScene} = useStoryScenes(ref(SCENES));

        showNextScene();
        showNextScene();

        expect(currentScene.value.id).toBe('second');
        expect(isLastScene.value).toBe(true);
    });

    it('не уходит назад раньше первой сцены', () => {
        const {sceneIndex, showPreviousScene} = useStoryScenes(ref(SCENES));

        showPreviousScene();

        expect(sceneIndex.value).toBe(0);
    });
});
