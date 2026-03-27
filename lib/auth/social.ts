import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
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
  const IS_MOCK = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (IS_MOCK) {
    // ── Mock para desarrollo sin credenciales Firebase ──────────────────────
    console.warn("[Firebase] Usando mock — configura .env.local con las credenciales reales.");
    const res = await authService.socialLogin({ id_token: "MOCK_FIREBASE_ID_TOKEN" });
    return (res as any).data ?? res;
  }

  // ── Flujo real ─────────────────────────────────────────────────────────────
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  const res = await authService.socialLogin({ id_token: idToken });
  return (res as any).data ?? res;
}
