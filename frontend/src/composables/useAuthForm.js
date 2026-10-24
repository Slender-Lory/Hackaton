import {storeToRefs} from 'pinia';
import {computed, reactive, ref} from 'vue';
import {professions} from '@/core/data/professions';
import {getErrorMessage} from '@/core/helpers/getErrorMessage';
import {AUTH_MODES, useAuthDialogStore} from '@/core/stores/authDialog';
import {usePlayerStore} from '@/core/stores/player';
import {useToastStore} from '@/core/stores/toast';
import {validateEmail, validatePassword} from '@/core/utils/authValidation';
import {validateNickname} from '@/core/utils/nicknameValidation';

/** @param {string[]} codes */
function getProfessionTitles(codes) {
    return codes.map((code) => professions.find((profession) => profession.code === code)?.title ?? code).join(', ');
}

export function useAuthForm() {
    const playerStore = usePlayerStore();
    const authDialogStore = useAuthDialogStore();
    const toastStore = useToastStore();
    const {isGuest, guest} = storeToRefs(playerStore);
    const {mode} = storeToRefs(authDialogStore);

    const fields = reactive({email: '', password: '', nickname: guest.value?.nickname ?? ''});
    const errors = reactive({email: null, password: null, nickname: null, form: null});
    const isSubmitting = ref(false);

    const isRegister = computed(() => mode.value === AUTH_MODES.register);
    const needsNickname = computed(() => isRegister.value && !isGuest.value);

    /** @param {keyof typeof errors} field */
    function resetError(field) {
        errors[field] = null;
        errors.form = null;
    }

    function validate() {
        errors.email = validateEmail(fields.email);
        errors.password = validatePassword(fields.password, {isNew: isRegister.value});
        errors.nickname = needsNickname.value ? validateNickname(fields.nickname) : null;

        return !errors.email && !errors.password && !errors.nickname;
    }

    async function submit() {
        errors.form = null;

        if (!validate()) {
            return;
        }

        const isRegistering = isRegister.value;
        isSubmitting.value = true;

        try {
            const credentials = {email: fields.email.trim(), password: fields.password};
            const result = isRegistering
                ? await playerStore.register({
                      ...credentials,
                      nickname: needsNickname.value ? fields.nickname : undefined,
                  })
                : await playerStore.login(credentials);

            toastStore.show(isRegistering ? 'Аккаунт создан, прогресс сохранён' : 'С возвращением!');

            if (result.skippedProfessions?.length) {
                toastStore.show(
                    `В аккаунте уже был прогресс: ${getProfessionTitles(result.skippedProfessions)}. Оставили его`,
                );
            }

            authDialogStore.close();
        } catch (error) {
            errors.form = getErrorMessage(error);
        } finally {
            isSubmitting.value = false;
        }
    }

    return {mode, fields, errors, isSubmitting, isRegister, needsNickname, isGuest, resetError, submit};
}
