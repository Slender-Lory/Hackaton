import {getHint} from '@/core/utils/shift';

export function personalizeDialogue(text, nickname) {
    const name = typeof nickname === 'string' ? nickname.trim() : '';
    return text?.replaceAll('{nickname}', () => name || 'доктор') ?? '';
}

export function isPatientPresent(step) {
    return Boolean(step) && step.patientPresent !== false;
}

export function getShiftGuidance(shift, difficulty) {
    return (
        getHint(shift?.hints, difficulty) ??
        'Выбери доступное дело на плане клиники. Подсвеченные комнаты открыты, закрытые станут доступны по ходу смены.'
    );
}

export function getPassportPrompt(step) {
    if (!isPatientPresent(step)) return null;
    if (['exam', 'checklist'].includes(step.kind)) {
        return 'Результаты осмотра и анализов попадут в паспорт. Там можно сравнить показатели с нормой и вернуться к находкам перед решением.';
    }
    return 'В паспорте — сведения о пациенте, показатели и результаты обследований. Загляни в него перед осмотром или выбором лечения: всё найденное остаётся под рукой.';
}
