<script setup>
import {onBeforeUnmount} from 'vue';

const props = defineProps({
    id: {type: Number, required: true},
    message: {type: String, required: true},
    timeout: {type: Number, default: 1800},
});

const emit = defineEmits(['close']);

const timer = setTimeout(() => emit('close', props.id), props.timeout);

onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
    <p
        class="toast"
        role="status"
    >
        {{ message }}
    </p>
</template>
