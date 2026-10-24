import {storeToRefs} from 'pinia';
import {computed, ref, watch} from 'vue';
import {isApiError} from '@/core/api/players';
import {ERROR_CODES, SHIFT_COUNT} from '@/core/constants';
import {START_COUNTERS, shifts} from '@/core/data/shifts';
import {getErrorMessage} from '@/core/helpers/getErrorMessage';
import {usePlayerStore} from '@/core/stores/player';
import {useToastStore} from '@/core/stores/toast';
import {applyEffects, getChapterPercent, getStepResult, isActivityFinished} from '@/core/utils/shift';

/** @typedef {import('@/core/types/shift').ShiftState} ShiftState */
/** @typedef {import('@/core/types/shift').ShiftStep} ShiftStep */
/** @typedef {import('@/core/types/shift').StepAnswer} StepAnswer */
/** @typedef {import('@/core/types/shift').ActivityAnswers} ActivityAnswers */

const SHIFT_STATE_VERSION = 1;
const FIRST_SHIFT = 1;
const CONFLICT_MESSAGE = 'Игра открыта в другой вкладке: продолжаем с её сохранения';

/** @returns {ShiftState} */
function createShiftState() {
    return {
        version: SHIFT_STATE_VERSION,
        shift: FIRST_SHIFT,
        counters: {...START_COUNTERS},
        completedActivities: [],
        answers: {},
    };
}

/**
 * @param {unknown} value
 * @returns {value is ShiftState}
 */
function isShiftState(value) {
    return value?.version === SHIFT_STATE_VERSION;
}

/** @param {import('vue').Ref<string>} professionCode */
export function useShift(professionCode) {
    const playerStore = usePlayerStore();
    const toastStore = useToastStore();
    const {isRestored} = storeToRefs(playerStore);

    /** @type {import('vue').Ref<ShiftState | null>} */
    const state = ref(null);
    /** @type {import('vue').Ref<string | null>} */
    const activeActivityCode = ref(null);

    const shift = computed(
        () => shifts[professionCode.value]?.find((item) => item.number === state.value?.shift) ?? null,
    );
    const counters = computed(() => state.value?.counters ?? START_COUNTERS);
    const completedActivities = computed(() => state.value?.completedActivities ?? []);
    const activeActivity = computed(
        () => shift.value?.activities.find((activity) => activity.code === activeActivityCode.value) ?? null,
    );
    const activityStatuses = computed(() =>
        Object.fromEntries(
            (shift.value?.activities ?? []).map((activity) => [activity.code, getActivityStatus(activity.code)]),
        ),
    );
    const isShiftFinished = computed(
        () => shift.value?.activities.every((activity) => completedActivities.value.includes(activity.code)) ?? false,
    );

    watch([isRestored, professionCode], loadState, {immediate: true});

    function loadState() {
        if (!isRestored.value) {
            return;
        }

        const saved = playerStore.getProgressState(professionCode.value);
        state.value = isShiftState(saved) ? saved : createShiftState();
    }

    /**
     * @param {string} activityCode
     * @returns {ActivityAnswers}
     */
    function getAnswers(activityCode) {
        return state.value?.answers[activityCode] ?? {};
    }

    /**
     * @param {string} activityCode
     * @returns {'new' | 'started' | 'done'}
     */
    function getActivityStatus(activityCode) {
        if (completedActivities.value.includes(activityCode)) {
            return 'done';
        }

        return Object.keys(getAnswers(activityCode)).length ? 'started' : 'new';
    }

    /** @param {string} activityCode */
    function openActivity(activityCode) {
        activeActivityCode.value = activityCode;
    }

    function closeActivity() {
        activeActivityCode.value = null;
    }

    /**
     * @param {ShiftStep} step
     * @param {StepAnswer} answer
     */
    function answerStep(step, answer) {
        const activity = activeActivity.value;

        if (!state.value || !activity || step.id in getAnswers(activity.code)) {
            return;
        }

        const answers = {...getAnswers(activity.code), [step.id]: answer};
        const isFinished = isActivityFinished(activity.steps, answers);

        state.value = {
            ...state.value,
            counters: applyEffects(state.value.counters, getStepResult(step, answer).effects),
            answers: {...state.value.answers, [activity.code]: answers},
            completedActivities: isFinished
                ? [...state.value.completedActivities, activity.code]
                : state.value.completedActivities,
        };

        persist();
    }

    async function persist() {
        const snapshot = state.value;

        try {
            await playerStore.saveProgress(professionCode.value, {
                level: snapshot.shift,
                percent: getChapterPercent({
                    shiftNumber: snapshot.shift,
                    completedCount: snapshot.completedActivities.length,
                    activityCount: shift.value?.activities.length ?? 0,
                    shiftCount: SHIFT_COUNT,
                }),
                state: snapshot,
            });
        } catch (error) {
            if (isApiError(error, ERROR_CODES.progressConflict)) {
                loadState();
                closeActivity();
                toastStore.show(CONFLICT_MESSAGE);

                return;
            }

            console.error(error);
            toastStore.show(getErrorMessage(error));
        }
    }

    return {
        state,
        shift,
        counters,
        completedActivities,
        activeActivity,
        activityStatuses,
        isShiftFinished,
        getAnswers,
        openActivity,
        closeActivity,
        answerStep,
    };
}
