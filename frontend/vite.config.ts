import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [vue()],
    server: {
      host: true,
      port: Number(env.VITE_PORT ?? 5173),
      // Dev-прокси: /api/... → backend (http://localhost:8080), префикс /api снимается.
      // Совпадает с поведением nginx в проде (см. infra/nginx/nginx.conf).
      proxy: {
        "/api": {
          target: env.VITE_DEV_API_TARGET ?? "http://localhost:8080",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
