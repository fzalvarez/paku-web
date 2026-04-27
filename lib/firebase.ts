import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

/**
 * Configuración de Firebase.
 * Usa variables `NEXT_PUBLIC_*` disponibles en cliente.
 * En local pueden vivir en `.env` sin problema.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("API KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log("PROJECT ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

const firebaseReady = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId,
);

if (!firebaseReady) {
  console.warn(
    "[Paku] Firebase no está completamente configurado. Revisa las variables NEXT_PUBLIC_FIREBASE_* en `.env` o en el entorno desplegado.",
  );
}

// Evita reinicializar en hot-reload
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { firebaseReady };
