import {storeToRefs} from 'pinia';
import {computed, ref, watch} from 'vue';
import {isApiError} from '@/core/api/players';
import {DIFFICULTIES, ERROR_CODES, SHIFT_COUNT} from '@/core/constants';
import {clinicRooms} from '@/core/data/clinic';
import {START_COUNTERS, chapterEndings, shifts} from '@/core/data/shifts';
import {getErrorMessage} from '@/core/helpers/getErrorMessage';
import {usePlayerStore} from '@/core/stores/player';
import {useToastStore} from '@/core/stores/toast';
import {
    applyEffects,
    getChapterPercent,
    getHint,
    getPatientChart,
    getStepResult,
    isActivityFinished,
    meetsConditions,
    pickByConditions,
    startShift,
} from '@/core/utils/shift';

/** @typedef {import('@/core/types/shift').ShiftState} ShiftState */
/** @typedef {import('@/core/types/shift').ShiftStep} ShiftStep */
/** @typedef {import('@/core/types/shift').StepAnswer} StepAnswer */
/** @typedef {import('@/core/types/shift').ActivityAnswers} ActivityAnswers */
/** @typedef {import('@/core/types/shift').Shift} Shift */
/** @typedef {import('@/core/types/shift').ShiftActivity} ShiftActivity */
/** @typedef {import('@/core/types/player').Difficulty} Difficulty */
/** @typedef {'new' | 'started' | 'done' | 'locked'} ActivityStatus */

const SHIFT_STATE_VERSION = 2;
const FIRST_SHIFT = 1;
const CONFLICT_MESSAGE = 'Игра открыта в другой вкладке: продолжаем с её сохранения';

/**
 * @param {readonly Shift[]} chapter
 * @returns {ShiftState}
 */
function createShiftState(chapter) {
    const state = {
        version: SHIFT_STATE_VERSION,
        shift: FIRST_SHIFT,
        difficulty: null,
        counters: {...START_COUNTERS},
        completedActivities: [],
        answers: {},
        morning: {},
    };
    const firstShift = chapter.find((item) => item.number === FIRST_SHIFT);

    return firstShift ? startShift(state, firstShift) : state;
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

    const chapter = computed(() => shifts[professionCode.value] ?? []);
    const shift = computed(() => chapter.value.find((item) => item.number === state.value?.shift) ?? null);
    const nextShift = computed(
        () => chapter.value.find((item) => item.number === (state.value?.shift ?? 0) + 1) ?? null,
    );
    const counters = computed(() => state.value?.counters ?? START_COUNTERS);
    const completedActivities = computed(() => state.value?.completedActivities ?? []);
    const activeActivity = computed(
        () => shift.value?.activities.find((activity) => activity.code === activeActivityCode.value) ?? null,
    );
    const activityStatuses = computed(() =>
        Object.fromEntries(
            (shift.value?.activities ?? []).map((activity) => [activity.code, getActivityStatus(activity)]),
        ),
    );
    const isShiftFinished = computed(
        () => shift.value?.activities.every((activity) => completedActivities.value.includes(activity.code)) ?? false,
    );
    const morningEvents = computed(() => {
        const firedIds = state.value?.morning[shift.value?.number] ?? [];

        return (shift.value?.morning ?? []).filter((event) => firedIds.includes(event.id));
    });
    const chapterEnding = computed(() => {
        if (!state.value || !isShiftFinished.value || nextShift.value) {
            return null;
        }

        return pickByConditions(chapterEndings[professionCode.value] ?? [], state.value);
    });
    const hasProgress = computed(
        () => (state.value?.shift ?? FIRST_SHIFT) > FIRST_SHIFT || Object.keys(state.value?.answers ?? {}).length > 0,
    );
    const difficulty = computed(() => state.value?.difficulty ?? DIFFICULTIES.normal);
    const needsDifficulty = computed(() => Boolean(state.value) && !state.value.difficulty && !hasProgress.value);
    const shiftHint = computed(() => getHint(shift.value?.hints, difficulty.value));
    const openRoomCodes = computed(() =>
        state.value
            ? clinicRooms.filter((room) => meetsConditions(room.unlock, state.value)).map((room) => room.code)
            : [],
    );
    const activeChart = computed(() =>
        state.value && activeActivity.value
            ? getPatientChart(chapter.value, state.value, activeActivity.value.patient.id)
            : {findings: [], readings: {}},
    );

    watch([isRestored, professionCode], loadState, {immediate: true});

    function loadState() {
        if (!isRestored.value) {
            return;
        }

        const saved = playerStore.getProgressState(professionCode.value);
        state.value = isShiftState(saved) ? saved : createShiftState(chapter.value);
    }

    function restart() {
        closeActivity();
        loadState();
    }

    /**
     * @param {string} activityCode
     * @returns {ActivityAnswers}
     */
    function getAnswers(activityCode) {
        return state.value?.answers[activityCode] ?? {};
    }

    /**
     * @param {ShiftActivity} activity
     * @returns {ActivityStatus}
     */
    function getActivityStatus(activity) {
        if (completedActivities.value.includes(activity.code)) {
            return 'done';
        }

        if (!state.value || !meetsConditions(activity.requires, state.value)) {
            return 'locked';
        }

        return Object.keys(getAnswers(activity.code)).length ? 'started' : 'new';
    }

    /** @param {string} activityCode */
    function openActivity(activityCode) {
        const activity = shift.value?.activities.find((item) => item.code === activityCode);

        if (activity && getActivityStatus(activity) !== 'locked') {
            activeActivityCode.value = activityCode;
        }
    }

    /** @param {Difficulty} value */
    function chooseDifficulty(value) {
        if (!state.value) {
            return;
        }

        state.value = {...state.value, difficulty: value};
        persist();
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

    /**
     * Черновик триажа сохраняется сразу: таймер идёт и после перезагрузки.
     * @param {import('@/core/types/triage').TriageState} triageState
     */
    function saveTriage(triageState) {
        const activity = activeActivity.value;

        if (!state.value || !activity || completedActivities.value.includes(activity.code)) {
            return;
        }

        state.value = {...state.value, answers: {...state.value.answers, [activity.code]: {triage: triageState}}};
        persist();
    }

    /**
     * Итог триажа: эффекты, финальное состояние и завершение дела — одним сохранением и один раз.
     * @param {import('@/core/types/triage').TriageResult} result
     * @param {import('@/core/types/triage').TriageState} triageState
     */
    function resolveTriage(result, triageState) {
        const activity = activeActivity.value;

        if (!state.value || !activity || completedActivities.value.includes(activity.code)) {
            return;
        }

        state.value = {
            ...state.value,
            counters: applyEffects(state.value.counters, result.effects),
            answers: {...state.value.answers, [activity.code]: {triage: triageState}},
            completedActivities: [...state.value.completedActivities, activity.code],
        };
        persist();
    }

    function startNextShift() {
        if (!state.value || !isShiftFinished.value || !nextShift.value) {
            return;
        }

        state.value = startShift(state.value, nextShift.value);
        closeActivity();
        persist();
    }

    async function persist() {
        const snapshot = state.value;
        const activities = shift.value?.activities ?? [];

        try {
            await playerStore.saveProgress(professionCode.value, {
                level: snapshot.shift,
                percent: getChapterPercent({
                    shiftNumber: snapshot.shift,
                    completedCount: activities.filter((activity) =>
                        snapshot.completedActivities.includes(activity.code),
                    ).length,
                    activityCount: activities.length,
                    shiftCount: SHIFT_COUNT,
                }),
                difficulty: snapshot.difficulty ?? DIFFICULTIES.normal,
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
        nextShift,
        morningEvents,
        chapterEnding,
        hasProgress,
        difficulty,
        needsDifficulty,
        shiftHint,
        openRoomCodes,
        activeChart,
        getAnswers,
        openActivity,
        closeActivity,
        answerStep,
        saveTriage,
        resolveTriage,
        startNextShift,
        chooseDifficulty,
        restart,
    };
}
