import {computed, ref} from 'vue';

/** @param {import('vue').Ref<readonly import('@/core/types/prologue').PrologueScene[]>} scenes */
export function useStoryScenes(scenes) {
    const sceneIndex = ref(0);

    const currentScene = computed(() => scenes.value[sceneIndex.value] ?? null);
    const isLastScene = computed(() => sceneIndex.value >= scenes.value.length - 1);

    function showNextScene() {
        if (!isLastScene.value) {
            sceneIndex.value += 1;
        }
    }

    function showPreviousScene() {
        if (sceneIndex.value > 0) {
            sceneIndex.value -= 1;
        }
    }

    return {sceneIndex, currentScene, isLastScene, showNextScene, showPreviousScene};
}
