import {storeToRefs} from 'pinia';
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {ROUTE_NAMES} from '@/core/constants';
import {usePlayerStore} from '@/core/stores/player';

/** @typedef {import('@/core/types/profession').Profession} Profession */

export function useStartGame() {
    const router = useRouter();
    const {isSignedIn} = storeToRefs(usePlayerStore());

    /** @type {import('vue').Ref<Profession | null>} */
    const pendingProfession = ref(null);

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
    }

    function continueAfterEnter() {
        const profession = pendingProfession.value;
        pendingProfession.value = null;

        if (profession) {
            openGame(profession);
        }
    }

    function cancelStart() {
        pendingProfession.value = null;
    }

    return {pendingProfession, startGame, continueAfterEnter, cancelStart};
}
