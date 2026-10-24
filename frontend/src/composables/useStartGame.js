import {storeToRefs} from 'pinia';
import {ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import {ROUTE_NAMES} from '@/core/constants';
import {AUTH_MODES, useAuthDialogStore} from '@/core/stores/authDialog';
import {usePlayerStore} from '@/core/stores/player';

/** @typedef {import('@/core/types/profession').Profession} Profession */

export function useStartGame() {
    const router = useRouter();
    const authDialogStore = useAuthDialogStore();
    const {isSignedIn} = storeToRefs(usePlayerStore());

    /** @type {import('vue').Ref<Profession | null>} */
    const pendingProfession = ref(null);
    const isNicknameFormOpen = ref(false);

    watch(isSignedIn, (signedIn) => {
        if (signedIn && pendingProfession.value) {
            continueAfterEnter();
        }
    });

    /** @param {Profession} profession */
    function openGame(profession) {
        router.push({name: ROUTE_NAMES.prologue, params: {profession: profession.code}});
    }

    /** @param {Profession} profession */
    function startGame(profession) {
        if (isSignedIn.value) {
            openGame(profession);

            return;
        }

        pendingProfession.value = profession;
        isNicknameFormOpen.value = true;
    }

    function continueAfterEnter() {
        const profession = pendingProfession.value;
        pendingProfession.value = null;
        isNicknameFormOpen.value = false;

        if (profession) {
            openGame(profession);
        }
    }

    function switchToLogin() {
        isNicknameFormOpen.value = false;
        authDialogStore.open(AUTH_MODES.login);
    }

    function cancelStart() {
        pendingProfession.value = null;
        isNicknameFormOpen.value = false;
    }

    return {isNicknameFormOpen, startGame, continueAfterEnter, switchToLogin, cancelStart};
}
