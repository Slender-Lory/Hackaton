<script setup>
import {computed} from 'vue';
import {ROUTE_NAMES} from '@/core/constants';

const props = defineProps({
    nickname: {type: String, required: true},
});

const initial = computed(() => props.nickname.trim().charAt(0).toUpperCase());
</script>

<template>
    <RouterLink
        class="header-player"
        :to="{name: ROUTE_NAMES.profile}"
        :title="`Профиль: ${nickname}`"
    >
        <span
            class="header-player__avatar"
            aria-hidden="true"
        >
            {{ initial }}
        </span>
        <span class="header-player__name">{{ nickname }}</span>
    </RouterLink>
</template>
