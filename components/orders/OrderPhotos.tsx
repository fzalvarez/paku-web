"use client";

import { useState } from "react";
import { Camera, ImageOff } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PHOTO_KIND_LABELS, label } from "@/lib/labels";
import { timeLima } from "@/lib/utils/dates";
import type { OrderPhotoOut } from "@/types/orders";

/** Fotos del servicio que sube el groomer (C-12). Al tocar una se ve en grande. */
export function OrderPhotos({ photos }: { photos: OrderPhotoOut[] }) {
  const [open, setOpen] = useState<OrderPhotoOut | null>(null);
  // URLs firmadas que no cargaron (p. ej. vencidas con la página abierta mucho tiempo)
  const [broken, setBroken] = useState<Set<string>>(new Set());

  if (photos.length === 0) return null;

  const markBroken = (id: string) => setBroken((prev) => new Set(prev).add(id));

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <Camera className="size-3.5" /> Fotos del servicio
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => {
          const canShow = !!photo.read_url && !broken.has(photo.id);
          return (
            <button
              key={photo.id}
              onClick={() => canShow && setOpen(photo)}
              className="group overflow-hidden rounded-xl border border-border text-left"
            >
              <div className="flex aspect-square items-center justify-center bg-muted">
                {canShow ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.read_url as string}
                    alt={label(PHOTO_KIND_LABELS, photo.kind)}
                    className="size-full object-cover transition-transform group-hover:scale-105"
                    onError={() => markBroken(photo.id)}
                  />
                ) : (
                  <ImageOff className="size-6 text-muted-foreground" />
                )}
              </div>
              <div className="px-2 py-1.5">
                <p className="text-xs font-semibold">{label(PHOTO_KIND_LABELS, photo.kind)}</p>
                <p className="text-[10px] text-muted-foreground">{timeLima(photo.created_at)}</p>
                {photo.note && <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{photo.note}</p>}
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{open ? label(PHOTO_KIND_LABELS, open.kind) : ""}</DialogTitle>
            <DialogDescription>
              {open ? timeLima(open.created_at) : ""}
              {open?.note ? ` · ${open.note}` : ""}
            </DialogDescription>
          </DialogHeader>
          {open?.read_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={open.read_url}
              alt={label(PHOTO_KIND_LABELS, open.kind)}
              className="max-h-[70vh] w-full rounded-xl object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
