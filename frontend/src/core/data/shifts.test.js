import {describe, expect, it} from 'vitest';
import {clinicRooms} from './clinic';
import {shifts} from './shifts';

const allShifts = Object.values(shifts).flat();
const allActivities = allShifts.flatMap((shift) => shift.activities.map((activity) => ({shift, activity})));

describe('shifts', () => {
    it('каждое дело стоит в комнате, открытой на этой смене', () => {
        allActivities.forEach(({shift, activity}) => {
            const room = clinicRooms.find((item) => item.code === activity.roomCode);

            expect(room?.unlockShift).toBeLessThanOrEqual(shift.number);
        });
    });

    it('коды дел и шагов внутри дела уникальны', () => {
        const codes = allActivities.map(({activity}) => activity.code);

        expect(new Set(codes).size).toBe(codes.length);
        allActivities.forEach(({activity}) => {
            const stepIds = activity.steps.map((step) => step.id);

            expect(new Set(stepIds).size).toBe(stepIds.length);
        });
    });

    it('у обследования владельца хватает бюджета на все нужные процедуры', () => {
        allActivities
            .flatMap(({activity}) => activity.steps)
            .filter((step) => step.kind === 'checklist' && step.payer === 'owner')
            .forEach((step) => {
                const neededCost = step.options
                    .filter((option) => option.isNeeded)
                    .reduce((total, option) => total + option.cost, 0);

                expect(neededCost).toBeLessThanOrEqual(step.budget ?? Infinity);
            });
    });
});
