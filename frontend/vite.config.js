import {defineConfig, loadEnv} from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import {fileURLToPath, URL} from 'node:url';

// https://vite.dev/config/
export default defineConfig(({mode}) => {
    const env = loadEnv(mode, '.', '');

    return {
        base: env.VITE_BASE ?? '/',
        plugins: [vue(), tailwindcss()],
        resolve: {
            alias: {'@': fileURLToPath(new URL('./src', import.meta.url))},
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern',
                    // Переменные и миксины доступны в каждом <style lang="scss"> без импорта.
                    additionalData: '@import "@/assets/styles/shared-resources.scss";\n',
                    silenceDeprecations: ['import'],
                },
            },
        },
        server: {
            host: true,
            port: Number(env.VITE_PORT ?? 5173),
            // Dev-прокси: /api/... → backend (http://localhost:8080) как есть, с префиксом /api.
            // Совпадает с поведением nginx в проде (см. infra/nginx/nginx.conf).
            proxy: {
                '/api': {
                    target: env.VITE_DEV_API_TARGET ?? 'http://localhost:8080',
                    changeOrigin: true,
                },
            },
        },
    };
});
