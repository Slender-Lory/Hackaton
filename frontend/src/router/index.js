import {createRouter, createWebHistory} from 'vue-router';
import {ROUTE_NAMES} from '@/core/constants';

import ProfessionsPage from '@/pages/ProfessionsPage.vue';

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior(to, from, savedPosition) {
        return savedPosition ?? {top: 0};
    },
    routes: [
        {path: '/', redirect: {name: ROUTE_NAMES.professions}},
        {path: '/professions', name: ROUTE_NAMES.professions, component: ProfessionsPage},
        {
            path: '/professions/:profession',
            name: ROUTE_NAMES.professionAbout,
            component: () => import('@/pages/ProfessionAboutPage.vue'),
        },
        {
            path: '/game/:profession/prologue',
            name: ROUTE_NAMES.prologue,
            component: () => import('@/pages/ProloguePage.vue'),
        },
        {path: '/game/:profession', name: ROUTE_NAMES.game, component: () => import('@/pages/GamePage.vue')},
        {path: '/profile', name: ROUTE_NAMES.profile, component: () => import('@/pages/ProfilePage.vue')},
        {path: '/:pathMatch(.*)*', redirect: {name: ROUTE_NAMES.professions}},
    ],
});
