<script setup>
import {Lock} from 'lucide-vue-next';
import {clinicRooms} from '@/core/data/clinic';
import {useToastStore} from '@/core/stores/toast';

const props = defineProps({
    shift: {type: Number, default: 1},
});

const toastStore = useToastStore();

/** @param {import('@/core/types/clinic').ClinicRoom} room */
function isRoomOpen(room) {
    return room.unlockShift <= props.shift;
}

/** @param {import('@/core/types/clinic').ClinicRoom} room */
function handleRoomClick(room) {
    if (isRoomOpen(room)) {
        toastStore.show(`${room.title}: сюда придёт первый пациент`);

        return;
    }

    toastStore.show(`${room.title} откроется на смене ${room.unlockShift}`);
}
</script>

<template>
    <div class="clinic-plan">
        <button
            v-for="room in clinicRooms"
            :key="room.code"
            type="button"
            :class="['clinic-plan__room', {'clinic-plan__room--locked': !isRoomOpen(room)}]"
            :style="{gridArea: room.area}"
            @click="handleRoomClick(room)"
        >
            <span class="clinic-plan__room-title">{{ room.title }}</span>
            <span
                v-if="!isRoomOpen(room)"
                class="clinic-plan__room-lock"
            >
                <Lock
                    :size="14"
                    aria-hidden="true"
                />
                Смена {{ room.unlockShift }}
            </span>
            <span
                v-else
                class="clinic-plan__room-status"
            >
                Открыто
            </span>
        </button>
    </div>
</template>

<style lang="scss">
.clinic-plan {
    display: grid;
    border: 2px dashed $color-playmat-line;
    border-radius: $radius-card + 6px;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(4, minmax(76px, auto));
    gap: $indent-step * 3;

    @include padding('y', 3);
    @include padding('x', 3);

    &__room {
        display: flex;
        align-items: flex-start;
        flex-direction: column;
        justify-content: space-between;
        transition: transform $duration $ease-out;
        text-align: left;
        color: $color-ink;
        border: 4px solid $color-profession-vet;
        border-radius: $radius-card-inner + 4px;
        background-color: $color-card-face;
        box-shadow: $shadow-button;
        gap: $indent-step * 2;

        @include padding('y', 3);
        @include padding('x', 3);

        @include hover {
            transform: translateY(-4px);
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
    }

    &__room-status {
        @include chip(rgba($color-profession-vet, 18%));
    }

    &__room-lock {
        @include chip(rgba($color-white, 16%), $color-white);
    }

    @include mobile {
        grid-template-rows: repeat(4, minmax(92px, auto));
        gap: $indent-step * 2;

        &__room-title {
            font-size: $font-size-xs;
        }
    }
}
</style>
