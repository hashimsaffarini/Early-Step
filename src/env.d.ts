interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** `"true"` enables the development mock server (MSW). */
  readonly VITE_USE_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
