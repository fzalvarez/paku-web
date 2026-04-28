"use client";

import { useState, useCallback } from "react";
import {
  mediaService,
  MediaEntityType,
  MediaContentType,
} from "@/lib/api/media";

const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB
const MAX_DIMENSION = 1200; // px

interface UploadPhotoResult {
  objectName: string;
  readUrl: string;
}

export interface UseUploadPhotoReturn {
  /**
   * Ejecuta el flujo completo de 3 pasos:
   *   1. Pide signed URL al backend
   *   2. Sube el binario directo a GCS
   *   3. Confirma la subida al backend
   *
   * @param entityType  "user" | "pet"
   * @param entityId    ID de la entidad
   * @param file        Archivo File del input[type=file] o del canvas comprimido
   */
  uploadPhoto: (
    entityType: MediaEntityType,
    entityId: string,
    file: File,
  ) => Promise<UploadPhotoResult>;
  isUploading: boolean;
  uploadError: string | null;
  clearUploadError: () => void;
}

/**
 * Comprime y redimensiona una imagen para que pese ≤ 1 MB.
 * Dibuja en un <canvas> offscreen y exporta como JPEG.
 */
async function compressImage(
  file: File,
): Promise<{ blob: Blob; mimeType: MediaContentType }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Calcular dimensiones respetando aspecto
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Intentar varias calidades hasta quedar bajo 1 MB
      const qualities = [0.85, 0.75, 0.65, 0.55, 0.45];
      let idx = 0;

      const tryQuality = () => {
        const q = qualities[idx] ?? 0.45;
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("canvas.toBlob failed"));
              return;
            }
            if (blob.size <= MAX_SIZE_BYTES || idx >= qualities.length - 1) {
              resolve({ blob, mimeType: "image/jpeg" });
            } else {
              idx++;
              tryQuality();
            }
          },
          "image/jpeg",
          q,
        );
      };

      tryQuality();
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

export function useUploadPhoto(): UseUploadPhotoReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadPhoto = useCallback(
    async (
      entityType: MediaEntityType,
      entityId: string,
      file: File,
    ): Promise<UploadPhotoResult> => {
      setIsUploading(true);
      setUploadError(null);

      try {
        // Comprimir antes de subir
        const { blob, mimeType } = await compressImage(file);
        const compressedFile = new File([blob], file.name, { type: mimeType });

        // Paso 1 — signed URL
        const { upload_url, object_name } =
          await mediaService.getSignedUploadUrl(entityType, entityId, mimeType);

        // Paso 2 — subir a GCS
        await mediaService.uploadToGCS(upload_url, compressedFile, mimeType);

        // Paso 3 — confirmar al backend
        const { read_url } = await mediaService.confirmPhoto(
          entityType,
          entityId,
          object_name,
        );

        return { objectName: object_name, readUrl: read_url };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Error al subir la foto";
        setUploadError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  const clearUploadError = useCallback(() => setUploadError(null), []);

  return { uploadPhoto, isUploading, uploadError, clearUploadError };
}
