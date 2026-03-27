import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

/**
 * Configuración de Firebase.
 * Todas las variables deben definirse en .env.local (desarrollo)
 * y en las Variables de Entorno de Vercel (producción).
 * Son públicas (NEXT_PUBLIC_) porque se usan en el cliente.
 */

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// En producción sin variables Firebase el login social no puede funcionar.
// Avisamos claramente en lugar de usar mocks silenciosos.
if (!apiKey || !authDomain || !projectId) {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[Paku] Variables de Firebase no configuradas. " +
      "Añade NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN y " +
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID en Vercel → Settings → Environment Variables."
    );
  } else {
    console.warn("[Paku] Firebase no configurado — el login social usará mock en desarrollo.");
  }
}

const firebaseConfig = {
  apiKey:            apiKey            ?? "MOCK_API_KEY",
  authDomain:        authDomain        ?? "mock.firebaseapp.com",
  projectId:         projectId         ?? "mock-project",
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? "mock.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "000000000000",
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             ?? "1:000000000000:web:mock",
};

// Evita reinicializar en hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/** True cuando Firebase está configurado con credenciales reales */
export const firebaseReady = Boolean(apiKey && authDomain && projectId);
