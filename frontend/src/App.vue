<script setup>
import {storeToRefs} from 'pinia';
import {useAuthDialogStore} from '@/core/stores/authDialog';

import AuthForm from '@/components/Forms/AuthForm.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import ToastContainer from '@/components/toast/ToastContainer.vue';

const {isOpen: isAuthDialogOpen} = storeToRefs(useAuthDialogStore());
</script>

<template>
    <DefaultLayout>
        <RouterView />
    </DefaultLayout>
    <AuthForm v-if="isAuthDialogOpen" />
    <ToastContainer />
</template>
