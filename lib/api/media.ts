import { getAccessToken } from "@/lib/session";
import { ENDPOINTS } from "./endpoints";

export type MediaEntityType = "user" | "pet";
export type MediaContentType = "image/jpeg" | "image/png" | "image/webp";

// ── Tipos de respuesta ─────────────────────────────────────────────────────────

interface SignedUploadResponse {
  upload_url: string;
  object_name: string;
  content_type: MediaContentType;
  expires_in: number;
}

interface ConfirmPhotoResponse {
  object_name: string;
  read_url: string;
  expires_in: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000"
).replace(/\/$/, "");

async function mediaPost<T>(path: string, body: object): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw Object.assign(new Error(`Media request failed: ${response.status}`), {
      status: response.status,
      data: err,
    });
  }

  return response.json();
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const mediaService = {
  /**
   * Paso 1 — Pide una URL firmada al backend para subir el archivo a GCS.
   */
  getSignedUploadUrl(
    entityType: MediaEntityType,
    entityId: string,
    contentType: MediaContentType,
  ): Promise<SignedUploadResponse> {
    return mediaPost<SignedUploadResponse>(ENDPOINTS.MEDIA.SIGNED_UPLOAD, {
      entity_type: entityType,
      entity_id: entityId,
      content_type: contentType,
    });
  },

  /**
   * Paso 2 — Sube el archivo binario DIRECTO a GCS usando la URL firmada.
   * No pasa por el backend ni lleva token de autorización.
   */
  async uploadToGCS(
    uploadUrl: string,
    file: File,
    contentType: MediaContentType,
  ): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
    });

    if (!response.ok) {
      throw new Error(
        `GCS upload failed: ${response.status} ${response.statusText}`,
      );
    }
  },

  /**
   * Paso 3 — Confirma al backend que la subida fue exitosa.
   */
  confirmPhoto(
    entityType: MediaEntityType,
    entityId: string,
    objectName: string,
  ): Promise<ConfirmPhotoResponse> {
    return mediaPost<ConfirmPhotoResponse>(ENDPOINTS.MEDIA.CONFIRM_PHOTO, {
      entity_type: entityType,
      entity_id: entityId,
      object_name: objectName,
    });
  },
};
