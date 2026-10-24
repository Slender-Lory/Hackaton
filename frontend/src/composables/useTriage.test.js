import {effectScope, nextTick, ref} from 'vue';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createTriageState} from '@/core/utils/triage';
import {useTriage} from './useTriage';

let scopes;
function setup(saved = null) {
    const scope = effectScope();
    scopes.push(scope);
    const source = ref(saved);
    const onState = vi.fn();
    const onResolve = vi.fn();
    const triage = scope.run(() => useTriage(source, {onState, onResolve}));
    return {triage, source, onState, onResolve, scope};
}

beforeEach(() => {
    scopes = [];
    vi.useFakeTimers();
    vi.setSystemTime(1000);
});
afterEach(() => {
    scopes.forEach((scope) => scope.stop());
    vi.useRealTimers();
});

describe('useTriage', () => {
    it('сразу отдаёт дедлайн для сохранения, изменения отдаются без завершения', () => {
        const {triage, onState, onResolve} = setup();
        expect(onState).toHaveBeenCalledTimes(1);
        triage.assign('doctor', 'dog');
        expect(onState).toHaveBeenLastCalledWith(
            expect.objectContaining({assignments: {doctor: 'dog', assistant: null}}),
        );
        expect(onResolve).not.toHaveBeenCalled();
    });

    it('восстанавливает оставшееся время, не новую минуту', () => {
        const saved = createTriageState(1000);
        vi.setSystemTime(41_000);
        const {triage, onState} = setup(saved);
        expect(triage.remainingSeconds.value).toBe(20);
        expect(onState).not.toHaveBeenCalled();
        vi.advanceTimersByTime(20_000);
        expect(triage.result.value.flags.timedOut).toBe(true);
    });

    it('истёкшее сохранение разрешается немедленно и только один раз', () => {
        const saved = {...createTriageState(0), assignments: {doctor: 'dog', assistant: null}};
        vi.setSystemTime(65_000);
        const {triage, onResolve} = setup(saved);
        expect(triage.result.value.outcomeId).toBe('dog-cat');
        expect(onResolve).toHaveBeenCalledTimes(1);
        triage.submit();
        triage.assign('doctor', 'cat');
        vi.advanceTimersByTime(10_000);
        expect(onResolve).toHaveBeenCalledTimes(1);
    });

    it('завершённый результат не начисляется повторно после восстановления', () => {
        const first = setup();
        first.triage.assign('doctor', 'rabbit');
        first.triage.assign('assistant', 'dog');
        expect(first.triage.submit()).toBe(true);
        const [, saved] = first.onResolve.mock.calls[0];
        const restored = setup(JSON.parse(JSON.stringify(saved)));
        expect(restored.triage.result.value.outcomeId).toBe('rabbit-dog');
        expect(restored.onResolve).not.toHaveBeenCalled();
        restored.triage.submit();
        expect(restored.onResolve).not.toHaveBeenCalled();
    });

    it('на границе минуты учитывает таймаут даже до следующего тика', () => {
        const {triage, onResolve} = setup();
        triage.assign('doctor', 'rabbit');
        vi.setSystemTime(61_000);
        triage.assign('assistant', 'dog');
        expect(onResolve.mock.calls[0][0].flags.timedOut).toBe(true);
        expect(triage.result.value.flags.dogHelped).toBe(false);
    });

    it('не завершает неполное распределение раньше срока', () => {
        const {triage, onResolve} = setup();
        expect(triage.submit()).toBe(false);
        expect(onResolve).not.toHaveBeenCalled();
    });

    it('финальный state передаётся атомарно с resolve, а не отдельным update', async () => {
        const {triage, onState, onResolve, source} = setup();
        triage.assign('doctor', 'dog');
        triage.assign('assistant', 'rabbit');
        const callsBefore = onState.mock.calls.length;
        triage.submit();
        expect(onState).toHaveBeenCalledTimes(callsBefore);
        const [result, saved] = onResolve.mock.calls[0];
        expect(saved.outcomeId).toBe(result.outcomeId);
        source.value = saved;
        await nextTick();
        expect(onResolve).toHaveBeenCalledTimes(1);
    });

    it('останавливает часы при закрытии компонента', () => {
        const {scope, onResolve} = setup();
        scope.stop();
        vi.advanceTimersByTime(90_000);
        expect(onResolve).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });
});
