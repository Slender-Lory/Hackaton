/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовый URL API: относительный "/api" (dev-прокси Vite / prod nginx) или абсолютный */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
