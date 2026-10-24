import {computed, onScopeDispose, ref, watch} from 'vue';
import {TRIAGE_SCENARIO_ID} from '@/core/data/triage';
import {
    assignTriagePatient,
    completeTimedOutAssignment,
    createTriageState,
    getRemainingSeconds,
    getWaitingPatient,
    isCompleteAssignment,
    isTriageState,
    resolveTriage,
} from '@/core/utils/triage';

export function useTriage(
    savedState,
    {scenarioId = TRIAGE_SCENARIO_ID, onState = () => {}, onResolve = () => {}, now = () => Date.now()} = {},
) {
    const clock = ref(now());
    const state = ref(null);
    const remainingSeconds = computed(() => getRemainingSeconds(state.value.deadlineAt, clock.value));
    const isResolved = computed(() => state.value.outcomeId !== null);
    const canSubmit = computed(() => !isResolved.value && isCompleteAssignment(state.value.assignments));
    const waitingPatient = computed(() => getWaitingPatient(state.value.assignments));
    const result = computed(() => (isResolved.value ? resolveTriage(state.value) : null));

    function update(nextState) {
        state.value = nextState;
        onState(nextState);
    }

    function finish(timedOut = false) {
        if (isResolved.value || (!timedOut && !canSubmit.value)) return false;
        const nextState = {
            ...state.value,
            assignments: timedOut ? completeTimedOutAssignment(state.value.assignments) : {...state.value.assignments},
            timedOut,
            resolvedAt: now(),
        };
        const resolution = resolveTriage(nextState);
        nextState.outcomeId = resolution.outcomeId;
        state.value = nextState;
        onResolve(resolution, nextState);
        return true;
    }

    function tick() {
        clock.value = now();
        if (!isResolved.value && remainingSeconds.value === 0) finish(true);
    }

    watch(
        savedState,
        (saved) => {
            clock.value = now();
            if (isTriageState(saved, scenarioId)) {
                state.value = {...saved, assignments: {...saved.assignments}};
            } else if (state.value === null) {
                update(createTriageState(clock.value, scenarioId));
            }
            tick();
        },
        {immediate: true, deep: true},
    );

    function assign(role, patientId) {
        tick();
        if (isResolved.value) return;
        update({...state.value, assignments: assignTriagePatient(state.value.assignments, role, patientId)});
    }

    function setWaitingDecision(decision) {
        tick();
        if (isResolved.value || !['accept', 'refer'].includes(decision)) return;
        update({...state.value, waitingDecision: decision});
    }

    function submit() {
        tick();
        return finish();
    }

    const intervalId = setInterval(tick, 250);
    onScopeDispose(() => clearInterval(intervalId));

    return {state, remainingSeconds, isResolved, canSubmit, waitingPatient, result, assign, setWaitingDecision, submit};
}
