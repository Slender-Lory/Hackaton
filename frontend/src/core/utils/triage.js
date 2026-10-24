import {REPUTATION} from '@/core/data/reputation';
import {TRIAGE_DURATION_MS, TRIAGE_OUTCOMES, TRIAGE_PATIENTS, TRIAGE_SCENARIO_ID} from '@/core/data/triage';

const PATIENT_IDS = TRIAGE_PATIENTS.map((patient) => patient.id);
const FALLBACK_ORDER = ['cat', 'dog', 'parrot'];

export function createTriageState(now, scenarioId = TRIAGE_SCENARIO_ID) {
    return {
        version: 1,
        scenarioId,
        deadlineAt: now + TRIAGE_DURATION_MS,
        assignments: {doctor: null, assistant: null},
        waitingDecision: 'accept',
        outcomeId: null,
        resolvedAt: null,
        timedOut: false,
    };
}

export function isTriageState(value, scenarioId = TRIAGE_SCENARIO_ID) {
    if (value?.version !== 1 || value.scenarioId !== scenarioId || !Number.isFinite(value.deadlineAt)) return false;
    if (!value.assignments || !['accept', 'refer'].includes(value.waitingDecision)) return false;
    const {doctor, assistant} = value.assignments;
    if (![doctor, assistant].every((patient) => patient === null || PATIENT_IDS.includes(patient))) return false;
    if (doctor !== null && doctor === assistant) return false;
    if (typeof value.timedOut !== 'boolean') return false;
    if (value.outcomeId === null) return value.resolvedAt === null;
    if (!Object.hasOwn(TRIAGE_OUTCOMES, value.outcomeId) || !Number.isFinite(value.resolvedAt)) return false;
    return isCompleteAssignment(value.assignments) && resolveTriage(value).outcomeId === value.outcomeId;
}

export function getRemainingSeconds(deadlineAt, now) {
    return Math.max(0, Math.ceil((deadlineAt - now) / 1000));
}

export function isCompleteAssignment(assignments) {
    return (
        PATIENT_IDS.includes(assignments?.doctor) &&
        PATIENT_IDS.includes(assignments?.assistant) &&
        assignments.doctor !== assignments.assistant
    );
}

export function getWaitingPatient(assignments) {
    return isCompleteAssignment(assignments)
        ? PATIENT_IDS.find((patient) => !Object.values(assignments).includes(patient))
        : null;
}

export function assignTriagePatient(assignments, role, patientId) {
    if (!['doctor', 'assistant'].includes(role) || !PATIENT_IDS.includes(patientId)) return assignments;
    const otherRole = role === 'doctor' ? 'assistant' : 'doctor';
    return {
        ...assignments,
        [role]: patientId,
        [otherRole]: assignments[otherRole] === patientId ? assignments[role] : assignments[otherRole],
    };
}

export function completeTimedOutAssignment(assignments) {
    const completed = {...assignments};
    for (const role of ['doctor', 'assistant']) {
        if (!PATIENT_IDS.includes(completed[role])) {
            completed[role] = FALLBACK_ORDER.find((patient) => !Object.values(completed).includes(patient));
        }
    }
    return completed;
}

export function resolveTriage(state) {
    if (!isCompleteAssignment(state.assignments)) throw new Error('Сначала распредели пациентов');
    const {doctor, assistant} = state.assignments;
    const waiting = getWaitingPatient(state.assignments);
    const referred = state.waitingDecision === 'refer' && waiting !== 'parrot';
    const parrotSaved = waiting !== 'parrot';
    const strayHelped = !(waiting === 'dog' && referred);
    const catTreated = !(waiting === 'cat' && referred);
    const correctPriority = parrotSaved && (doctor === 'dog' || assistant === 'dog');
    const allStable = parrotSaved && strayHelped && catTreated;
    const outcomeId = referred ? (waiting === 'dog' ? 'stray-refused' : 'owner-left') : `${doctor}-${assistant}`;
    const reputationEvents = [
        {code: parrotSaved ? 'parrotSaved' : 'parrotDied', label: parrotSaved ? 'Попугай спасён' : 'Потеря попугая'},
        {
            code: strayHelped ? 'strayHelped' : 'strayRefused',
            label: strayHelped ? 'Помощь бродячей собаке' : 'Отказ собаке Олега',
        },
        ...(allStable ? [{code: 'triageNoLosses', label: 'Все пациенты стабильны'}] : []),
        ...(!parrotSaved ? [{code: 'triageLoss', label: 'Потеря пациента в триаже'}] : []),
        {
            code: correctPriority ? 'triageRightOrder' : 'triageWrongOrder',
            label: correctPriority ? 'Верный приоритет' : 'Неверный приоритет',
        },
        ...(!catTreated ? [{code: 'ownerRefusedToWait', label: 'Владелица ушла'}] : []),
    ].map((event) => ({...event, value: REPUTATION[event.code]}));

    return {
        scenarioId: state.scenarioId,
        outcomeId,
        ...TRIAGE_OUTCOMES[outcomeId],
        effects: {
            revenue: (catTreated ? 1400 : 0) - (parrotSaved ? 600 : 200) - (strayHelped ? 400 : 0),
            reputation: reputationEvents.reduce((total, event) => total + event.value, 0),
        },
        patientOutcomes: {
            parrot: parrotSaved ? 'stable' : 'lost',
            dog: strayHelped ? 'stable' : 'referred',
            cat: catTreated ? 'stable' : 'referred',
        },
        flags: {parrotSaved, strayHelped, correctPriority, allStable, timedOut: state.timedOut},
        order: [doctor, assistant, waiting],
        reputationEvents,
    };
}
