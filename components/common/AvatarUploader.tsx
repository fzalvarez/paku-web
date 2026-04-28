"use client";

/**
 * AvatarUploader
 *
 * Equivalente web del AvatarPicker de la app Expo.
 * Muestra la foto actual (o un placeholder), y al hacer clic abre el
 * selector de archivo nativo del browser.
 *
 * Props:
 *   currentUrl   – URL de la foto ya guardada (viene del backend)
 *   previewFile  – File seleccionado localmente aún no subido (estado local del form)
 *   onFileSelect – callback con el File elegido por el usuario
 *   isUploading  – muestra spinner encima del avatar
 *   size         – tamaño en px del círculo (default 96)
 *   disabled     – deshabilita el botón
 */

import { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarUploaderProps {
  currentUrl?: string | null;
  previewFile?: File | null;
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  size?: number;
  disabled?: boolean;
  className?: string;
}

const ACCEPTED = "image/jpeg,image/png,image/webp";

export function AvatarUploader({
  currentUrl,
  previewFile,
  onFileSelect,
  isUploading = false,
  size = 96,
  disabled = false,
  className,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // El preview local tiene prioridad sobre la URL del servidor
  const previewUrl = previewFile
    ? URL.createObjectURL(previewFile)
    : currentUrl;

  function handleClick() {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset para permitir seleccionar el mismo archivo de nuevo
      e.target.value = "";
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isUploading}
        style={{ width: size, height: size }}
        className={cn(
          "relative overflow-hidden rounded-full border-2 border-dashed border-border bg-primary/10 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !disabled &&
            !isUploading &&
            "cursor-pointer hover:border-primary hover:bg-primary/15",
          (disabled || isUploading) && "cursor-not-allowed opacity-70",
        )}
        aria-label="Subir foto"
      >
        {/* Imagen previa o placeholder */}
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Foto de perfil"
            className="h-full w-full object-cover"
          />
        ) : (
          <Camera
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/50"
            style={{ width: size * 0.33, height: size * 0.33 }}
          />
        )}

        {/* Overlay oscuro al hover cuando hay imagen */}
        {previewUrl && !isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/40">
            <Camera className="hidden size-6 text-white group-hover:block" />
          </div>
        )}

        {/* Spinner durante upload */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="size-6 animate-spin text-white" />
          </div>
        )}
      </button>

      <span className="text-xs text-muted-foreground">
        {isUploading ? "Subiendo…" : "Toca para cambiar foto"}
      </span>

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="sr-only"
        onChange={handleChange}
        disabled={disabled || isUploading}
      />
    </div>
  );
}
