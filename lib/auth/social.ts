import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, firebaseReady } from "@/lib/firebase";
import { authService } from "@/lib/api/auth";
import type { SocialLoginResponse } from "@/types/auth";

/**
 * Ejecuta el popup de Google vía Firebase,
 * obtiene el ID Token y lo envía al backend.
 *
 * Retorna la respuesta del backend con los JWT propios
 * y el flag is_new_user para redirigir si corresponde.
 */
export async function signInWithGoogle(): Promise<SocialLoginResponse> {
  if (!firebaseReady) {
    // ── Mock solo para desarrollo local sin credenciales Firebase ─────────
    console.warn(
      "[Firebase] Usando mock — configura las variables NEXT_PUBLIC_FIREBASE_* en .env.local"
    );
    const res = await authService.socialLogin({ id_token: "MOCK_FIREBASE_ID_TOKEN" });
    return (res as { data?: SocialLoginResponse } & SocialLoginResponse).data ?? res;
  }

  // ── Flujo real ─────────────────────────────────────────────────────────────
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  const res = await authService.socialLogin({ id_token: idToken });
  return (res as { data?: SocialLoginResponse } & SocialLoginResponse).data ?? res;
}
