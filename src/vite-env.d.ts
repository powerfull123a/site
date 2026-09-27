/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_PAYMENT_PROVIDER?: string
  readonly VITE_PAYMENT_PUBLIC_KEY?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_ADMIN_EMAIL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
