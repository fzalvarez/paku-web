import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

/**
 * Configuración de Firebase.
 * Las variables de entorno se definen en .env.local (nunca en .env para credenciales).
 * Todas son públicas (NEXT_PUBLIC_) ya que van al cliente.
 *
 * Si alguna variable falta se usa un valor mock que evita el crash en desarrollo,
 * pero el login real con Google requiere las credenciales reales.
 */

function env(key: string, fallback: string): string {
  const val = process.env[key];
  // ?? solo actúa con null/undefined; necesitamos también proteger el string vacío
  return val && val.trim() !== "" ? val : fallback;
}

const firebaseConfig = {
  apiKey:            env("NEXT_PUBLIC_FIREBASE_API_KEY",            "MOCK_API_KEY"),
  authDomain:        env("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",        "mock.firebaseapp.com"),
  projectId:         env("NEXT_PUBLIC_FIREBASE_PROJECT_ID",         "mock-project"),
  storageBucket:     env("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",     "mock.appspot.com"),
  messagingSenderId: env("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID","000000000000"),
  appId:             env("NEXT_PUBLIC_FIREBASE_APP_ID",             "1:000000000000:web:mock"),
};

// Evita reinicializar en hot-reload de Next.js
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
