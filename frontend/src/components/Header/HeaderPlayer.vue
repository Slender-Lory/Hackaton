<script setup>
import {computed} from 'vue';

const props = defineProps({
    nickname: {type: String, required: true},
});

const initial = computed(() => props.nickname.trim().charAt(0).toUpperCase());
</script>

<template>
    <span
        class="header-player"
        :title="nickname"
    >
        <span
            class="header-player__avatar"
            aria-hidden="true"
        >
            {{ initial }}
        </span>
        <span class="header-player__name">{{ nickname }}</span>
    </span>
</template>
