/**
 * @typedef {'parrot' | 'dog' | 'cat'} TriagePatientId
 * @typedef {{doctor: TriagePatientId | null, assistant: TriagePatientId | null}} TriageAssignments
 * @typedef {object} TriageState
 * @property {1} version
 * @property {string} scenarioId
 * @property {number} deadlineAt
 * @property {TriageAssignments} assignments
 * @property {'accept' | 'refer'} waitingDecision
 * @property {string | null} outcomeId
 * @property {number | null} resolvedAt
 * @property {boolean} timedOut
 *
 * @typedef {object} TriageResult
 * @property {string} scenarioId
 * @property {string} outcomeId
 * @property {string} title
 * @property {string} feedback
 * @property {{revenue: number, reputation: number}} effects
 * @property {Record<TriagePatientId, string>} patientOutcomes
 * @property {{parrotSaved: boolean, strayHelped: boolean, correctPriority: boolean, allStable: boolean, timedOut: boolean}} flags
 * @property {TriagePatientId[]} order
 * @property {{code: string, label: string, value: number}[]} reputationEvents
 */

export {};
