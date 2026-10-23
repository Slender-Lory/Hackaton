<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import ToastContainer from '@/components/toast/ToastContainer.vue';
</script>

<template>
    <DefaultLayout>
        <RouterView />
    </DefaultLayout>
    <ToastContainer />
</template>
