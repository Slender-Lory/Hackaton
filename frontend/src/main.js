import {createPinia} from 'pinia';
import {createApp} from 'vue';
import {router} from '@/router';

import App from '@/App.vue';

import '@/assets/styles/tailwind.css';
import '@/assets/styles/global.scss';

createApp(App).use(createPinia()).use(router).mount('#root');
