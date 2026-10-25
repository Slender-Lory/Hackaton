import {clinicRooms} from '@/core/data/clinic';

export function getNextActivity(activities, statuses, openRoomCodes) {
    const available = clinicRooms
        .filter((room) => openRoomCodes.includes(room.code))
        .map((room) => activities.find((activity) => activity.roomCode === room.code))
        .filter((activity) => activity && ['new', 'started'].includes(statuses[activity.code]));

    return available.find((activity) => statuses[activity.code] === 'started') ?? available[0] ?? null;
}

export function personalizeDialogue(text, nickname) {
    const name = typeof nickname === 'string' ? nickname.trim() : '';
    return text?.replaceAll('{nickname}', () => name || 'доктор') ?? '';
}

export function isPatientPresent(step) {
    return Boolean(step) && step.patientPresent !== false;
}

export function getShiftGuidance() {
    return 'Нажми на подсвеченную комнату, чтобы начать или продолжить дело.';
}

export function getPassportPrompt(step) {
    if (!isPatientPresent(step)) return null;
    if (['exam', 'checklist'].includes(step.kind)) {
        return 'Результаты осмотра и анализов попадут в паспорт. Там можно сравнить показатели с нормой и вернуться к находкам перед решением.';
    }
    return 'В паспорте — сведения о пациенте, показатели и результаты обследований. Загляни в него перед осмотром или выбором лечения: всё найденное остаётся под рукой.';
}
