/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent;
  export default component;
}

interface ImportMetaEnv {
  /** Базовый URL API: относительный "/api" (dev-прокси Vite / prod nginx) или абсолютный */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
