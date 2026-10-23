import {createRouter, createWebHistory} from 'vue-router';
import {ROUTE_NAMES} from '@/core/constants';

import ProfessionsPage from '@/pages/ProfessionsPage.vue';

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        // Главной страницы пока нет — сразу к выбору профессии
        {path: '/', redirect: {name: ROUTE_NAMES.professions}},
        {path: '/professions', name: ROUTE_NAMES.professions, component: ProfessionsPage},
        {path: '/game/:profession', name: ROUTE_NAMES.game, component: () => import('@/pages/GamePage.vue')},
        {path: '/:pathMatch(.*)*', redirect: {name: ROUTE_NAMES.professions}},
    ],
});
