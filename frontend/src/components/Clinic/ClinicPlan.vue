<script setup>
import {computed} from 'vue';
import {Check, Hourglass, Lock, PawPrint} from 'lucide-vue-next';
import {clinicRooms} from '@/core/data/clinic';
import {useToastStore} from '@/core/stores/toast';

/** @typedef {import('@/core/types/clinic').ClinicRoom} ClinicRoom */
/** @typedef {import('@/core/types/shift').ShiftActivity} ShiftActivity */

const props = defineProps({
    /** @type {import('vue').PropType<string[]>} */
    openRoomCodes: {type: Array, default: () => []},
    /** @type {import('vue').PropType<ShiftActivity[]>} */
    activities: {type: Array, default: () => []},
    /** @type {import('vue').PropType<Record<string, 'new' | 'started' | 'done' | 'locked'>>} */
    statuses: {type: Object, default: () => ({})},
});

const emit = defineEmits(['open']);

const toastStore = useToastStore();

const ROOM_SLOTS = Object.freeze([
    '1 / 1 / 3 / 3',
    '1 / 3 / 3 / 5',
    '1 / 5 / 3 / 7',
    '3 / 1 / 5 / 4',
    '3 / 4 / 5 / 6',
    '3 / 6 / 5 / 7',
]);

/**
 * Порядок на плане: сначала комнаты, где ждут игрока, потом открытые остальные, закрытые — в конце.
 * @param {{isOpen: boolean, status: string | null}} room
 * @returns {number}
 */
function getRoomRank(room) {
    if (!room.isOpen) {
        return 2;
    }

    return room.status === 'new' || room.status === 'started' ? 0 : 1;
}

const rooms = computed(() =>
    clinicRooms
        .map((room) => {
            const activity = props.activities.find((item) => item.roomCode === room.code) ?? null;

            return {
                ...room,
                activity,
                isOpen: props.openRoomCodes.includes(room.code),
                status: activity ? (props.statuses[activity.code] ?? 'new') : null,
            };
        })
        .sort((first, second) => getRoomRank(first) - getRoomRank(second))
        .map((room, index) => ({...room, area: ROOM_SLOTS[index]})),
);

/** @param {(typeof rooms.value)[number]} room */
function handleRoomClick(room) {
    if (!room.isOpen) {
        toastStore.show(room.lockedText ?? `${room.title} пока закрыта`);

        return;
    }

    if (!room.activity) {
        toastStore.show(`${room.title}: сегодня здесь никого`);

        return;
    }

    if (room.status === 'done') {
        toastStore.show(`${room.title}: на сегодня всё сделано`);

        return;
    }

    if (room.status === 'locked') {
        toastStore.show(room.activity.lockedText ?? `${room.activity.patient.name}: пока рано`);

        return;
    }

    emit('open', room.activity.code);
}
</script>

<template>
    <div class="clinic-plan">
        <button
            v-for="room in rooms"
            :key="room.code"
            type="button"
            :class="[
                'clinic-plan__room',
                {
                    'clinic-plan__room--locked': !room.isOpen,
                    'clinic-plan__room--waiting': room.status === 'new' || room.status === 'started',
                },
            ]"
            :style="{'--area': room.area}"
            @click="handleRoomClick(room)"
        >
            <span class="clinic-plan__room-title">{{ room.title }}</span>
            <span
                v-if="!room.isOpen"
                class="clinic-plan__room-lock"
            >
                <Lock
                    :size="14"
                    aria-hidden="true"
                />
                {{ room.lockedLabel ?? 'Закрыто' }}
            </span>
            <span
                v-else-if="room.status === 'done'"
                class="clinic-plan__room-status"
            >
                <Check
                    :size="14"
                    aria-hidden="true"
                />
                Готово
            </span>
            <span
                v-else-if="room.status === 'started'"
                class="clinic-plan__room-call"
            >
                Продолжить
            </span>
            <span
                v-else-if="room.status === 'locked'"
                class="clinic-plan__room-status"
            >
                <Hourglass
                    :size="14"
                    aria-hidden="true"
                />
                Позже: {{ room.activity.patient.name }}
            </span>
            <span
                v-else-if="room.activity"
                class="clinic-plan__room-call"
            >
                <PawPrint
                    :size="14"
                    aria-hidden="true"
                />
                {{ room.activity.patient.name }}
            </span>
            <span
                v-else
                class="clinic-plan__room-status"
            >
                Свободно
            </span>
        </button>
    </div>
</template>

<style lang="scss">
.clinic-plan {
    display: grid;
    border: 2px dashed $color-playmat-line;
    border-radius: $radius-card + 6px;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    grid-template-rows: repeat(4, minmax(76px, auto));
    gap: $indent-step * 3;

    @include padding('y', 3);
    @include padding('x', 3);

    &__room {
        display: flex;
        align-items: flex-start;
        flex-direction: column;
        justify-content: space-between;
        min-width: 0;
        transition: transform $duration $ease-out;
        text-align: left;
        color: $color-ink;
        border: 4px solid $color-profession-vet;
        border-radius: $radius-card-inner + 4px;
        background-color: $color-card-face;
        box-shadow: $shadow-button;
        gap: $indent-step * 2;
        grid-area: var(--area);

        @include padding('y', 3);
        @include padding('x', 3);

        @include hover {
            transform: translateY(-4px);
        }

        &--waiting {
            border-color: $color-action;
            box-shadow:
                0 0 0 4px rgba($color-action, 35%),
                $shadow-button;
        }

        &--locked {
            color: $color-white;

            @include card-back;

            border-width: 3px;
            border-radius: $radius-card-inner + 4px;
        }
    }

    &__room-title {
        font-weight: $font-weight-bold;
        line-height: 1.2;
        overflow-wrap: anywhere;
    }

    &__room-status {
        @include chip(rgba($color-profession-vet, 18%));
    }

    &__room-call {
        @include chip($color-action);
    }

    &__room-lock {
        @include chip(rgba($color-white, 16%), $color-white);
    }

    @include mobile {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-template-rows: none;
        grid-auto-rows: minmax(92px, auto);
        gap: $indent-step * 2;

        @include padding('y', 2);
        @include padding('x', 2);

        &__room {
            grid-area: auto;
        }

        &__room-title {
            font-size: $font-size-sm;
        }
    }
}
</style>
