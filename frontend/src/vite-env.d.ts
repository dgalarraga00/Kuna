/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base de la API de Kuna, incluyendo el prefijo /api. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
