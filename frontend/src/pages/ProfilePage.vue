<script setup>
import {storeToRefs} from 'pinia';
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {CloudUpload, LogIn, LogOut, Play, Trash2} from 'lucide-vue-next';
import {ROUTE_NAMES} from '@/core/constants';
import {AUTH_MODES, useAuthDialogStore} from '@/core/stores/authDialog';
import {usePlayerStore} from '@/core/stores/player';
import {useToastStore} from '@/core/stores/toast';

import DeleteAccountForm from '@/components/Forms/DeleteAccountForm.vue';
import ResetProgressForm from '@/components/Forms/ResetProgressForm.vue';
import PlayerCard from '@/components/Profile/PlayerCard.vue';
import ProfessionProgressList from '@/components/Profile/ProfessionProgressList.vue';
import UiButton from '@/components/Ui/UiButton.vue';
import UiModal from '@/components/Ui/UiModal.vue';

const router = useRouter();
const playerStore = usePlayerStore();
const authDialogStore = useAuthDialogStore();
const toastStore = useToastStore();
const {account, isAccount, isGuest, isSignedIn, isRestored, nickname} = storeToRefs(playerStore);

const isDeleteFormOpen = ref(false);
const isLeaveGuestOpen = ref(false);
/** @type {import('vue').Ref<import('@/core/types/profession').Profession | null>} */
const resettingProfession = ref(null);

async function handleLogout() {
    await playerStore.logout();
    toastStore.show('Ты вышел из аккаунта на этом устройстве');
    router.push({name: ROUTE_NAMES.professions});
}

function handleLeaveGuest() {
    playerStore.leaveGuest();
    isLeaveGuestOpen.value = false;
    router.push({name: ROUTE_NAMES.professions});
}

/** @param {import('@/core/types/profession').Profession} profession */
function handleResetRequest(profession) {
    resettingProfession.value = profession;
}

function handleReset() {
    toastStore.show(`Прогресс «${resettingProfession.value?.title}» сброшен`);
    resettingProfession.value = null;
}

function handleDeleted() {
    isDeleteFormOpen.value = false;
    toastStore.show('Аккаунт удалён');
    router.push({name: ROUTE_NAMES.professions});
}
</script>

<template>
    <div
        v-if="isRestored"
        class="profile-page"
    >
        <template v-if="isSignedIn">
            <div class="profile-page__layout">
                <PlayerCard
                    class="profile-page__card"
                    :nickname="nickname"
                    :email="account?.email ?? null"
                    :since="account?.createdAt ?? null"
                />

                <div class="profile-page__main">
                    <section
                        v-if="isGuest"
                        class="profile-page__save"
                        aria-labelledby="profile-save-title"
                    >
                        <CloudUpload
                            class="profile-page__save-icon"
                            :size="32"
                            aria-hidden="true"
                        />
                        <div class="profile-page__save-text">
                            <h2
                                id="profile-save-title"
                                class="profile-page__save-title"
                            >
                                Прогресс хранится только в этом браузере
                            </h2>
                            <p>Создай аккаунт, чтобы не потерять его и играть с любого устройства.</p>
                        </div>
                        <div class="profile-page__save-actions">
                            <UiButton @click="authDialogStore.open(AUTH_MODES.register)">Сохранить прогресс</UiButton>
                            <UiButton
                                theme="ghost"
                                @click="authDialogStore.open(AUTH_MODES.login)"
                            >
                                Уже есть аккаунт
                            </UiButton>
                        </div>
                    </section>

                    <section aria-labelledby="profile-progress-title">
                        <h2
                            id="profile-progress-title"
                            class="profile-page__title"
                        >
                            Прогресс по профессиям
                        </h2>
                        <ProfessionProgressList @reset="handleResetRequest" />
                    </section>

                    <div class="profile-page__actions">
                        <template v-if="isAccount">
                            <UiButton
                                theme="ghost"
                                @click="handleLogout"
                            >
                                <LogOut
                                    :size="18"
                                    aria-hidden="true"
                                />
                                Выйти
                            </UiButton>
                            <button
                                class="profile-page__danger-link"
                                type="button"
                                @click="isDeleteFormOpen = true"
                            >
                                <Trash2
                                    :size="16"
                                    aria-hidden="true"
                                />
                                Удалить аккаунт
                            </button>
                        </template>
                        <button
                            v-else
                            class="profile-page__danger-link"
                            type="button"
                            @click="isLeaveGuestOpen = true"
                        >
                            <LogOut
                                :size="16"
                                aria-hidden="true"
                            />
                            Начать заново с другим именем
                        </button>
                    </div>
                </div>
            </div>
        </template>

        <section
            v-else
            class="profile-page__empty"
        >
            <h1 class="profile-page__empty-title">Профиль появится, когда ты начнёшь</h1>
            <p class="profile-page__empty-text">Можно играть без регистрации — нужно только имя.</p>
            <div class="profile-page__save-actions">
                <UiButton
                    large
                    @click="router.push({name: ROUTE_NAMES.professions})"
                >
                    <Play
                        :size="20"
                        aria-hidden="true"
                    />
                    Выбрать профессию
                </UiButton>
                <UiButton
                    theme="ghost"
                    large
                    @click="authDialogStore.open(AUTH_MODES.login)"
                >
                    <LogIn
                        :size="20"
                        aria-hidden="true"
                    />
                    Войти по почте
                </UiButton>
            </div>
        </section>

        <DeleteAccountForm
            v-if="isDeleteFormOpen"
            @close="isDeleteFormOpen = false"
            @deleted="handleDeleted"
        />
        <ResetProgressForm
            v-if="resettingProfession"
            :profession="resettingProfession"
            @close="resettingProfession = null"
            @reset="handleReset"
        />
        <UiModal
            v-if="isLeaveGuestOpen"
            title="Начать заново?"
            description="Прогресс гостя хранится только в этом браузере и пропадёт. Чтобы сохранить его, создай аккаунт."
            @close="isLeaveGuestOpen = false"
        >
            <div class="profile-page__confirm">
                <UiButton
                    theme="quiet"
                    @click="isLeaveGuestOpen = false"
                >
                    Отмена
                </UiButton>
                <UiButton
                    theme="danger"
                    @click="handleLeaveGuest"
                >
                    Стереть прогресс
                </UiButton>
            </div>
        </UiModal>
    </div>
</template>

<style lang="scss">
$card-width: 320px;

.profile-page {
    @include padding('y', 8);

    &__layout {
        display: grid;
        align-items: start;
        grid-template-columns: $card-width minmax(0, 1fr);
        gap: $indent-step * 10;

        @include tablet {
            grid-template-columns: 1fr;
        }
    }

    &__card {
        rotate: -2deg;

        @include tablet {
            width: min(100%, $card-width);
            justify-self: center;
            rotate: 0deg;
        }
    }

    &__main {
        @include column($indent-step * 8);
    }

    &__title {
        @include display($font-size-xl);
        @include margin('bottom', 5);
    }

    &__save {
        display: grid;
        align-items: center;
        color: $color-ink;
        border-radius: $radius-card;
        background-color: $color-action;
        box-shadow: $shadow-card;
        grid-template-columns: auto minmax(0, 1fr);
        gap: $indent-step * 4;

        @include padding('y', 5);
        @include padding('x', 6);

        @include mobile {
            grid-template-columns: 1fr;
        }
    }

    &__save-title {
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
        line-height: 1.3;
    }

    &__save-actions {
        display: flex;
        flex-wrap: wrap;
        gap: $indent-step * 3;
        grid-column: 1 / -1;
    }

    &__save .ui-button--action {
        color: $color-white;
        background-color: $color-ink;
        box-shadow: $shadow-button;
    }

    &__save .ui-button--ghost {
        color: $color-ink;
        border-color: rgba($color-ink, 35%);
        background-color: transparent;
    }

    &__actions {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: $indent-step * 6;
    }

    &__danger-link {
        display: inline-flex;
        align-items: center;
        text-decoration: underline;
        text-underline-offset: 4px;
        color: $color-on-playmat-soft;
        font-weight: $font-weight-semibold;
        gap: $indent-step * 2;

        @include button-reset;

        @include hover {
            color: $color-danger;
        }
    }

    &__confirm {
        display: flex;
        justify-content: flex-end;
        gap: $indent-step * 3;
    }

    &__empty {
        align-items: center;
        min-height: 60vh;
        text-align: center;
        justify-content: center;

        @include column($indent-step * 5);
    }

    &__empty-title {
        max-width: 18ch;
        text-wrap: balance;

        @include display(clamp(32px, 5vw, 56px));
    }

    &__empty-text {
        color: $color-on-playmat-soft;
        font-size: $font-size-lg;
    }
}
</style>
