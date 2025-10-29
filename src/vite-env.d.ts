/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: string
  readonly VITE_SUPABASE_PROJECT_ID: string
  readonly VITE_ADMIN_EMAIL: string
  readonly VITE_ADMIN_PASSWORD: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_PAYMENT_UPI_ID: string
  readonly VITE_PAYMENT_QR_URL: string
  readonly VITE_ENABLE_TYPING_SOUND: string
  readonly VITE_ENABLE_ANIMATIONS: string
  readonly VITE_ENABLE_REALTIME: string
  readonly VITE_SUPPORT_EMAIL: string
  readonly VITE_SUPPORT_WHATSAPP: string
  readonly VITE_SUPPORT_PHONE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
