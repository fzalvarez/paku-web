import { MessageCircle, Share2 } from "lucide-react";

/** Compartir por WhatsApp y Facebook (enlaces simples, sin scripts de terceros). */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const text = encodeURIComponent(`${title} ${url}`);
  const encodedUrl = encodeURIComponent(url);
  const link =
    "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Share2 className="size-3.5" aria-hidden="true" />
        Compartir
      </span>
      <a className={link} href={`https://wa.me/?text=${text}`} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="size-3.5" aria-hidden="true" />
        WhatsApp
      </a>
      <a
        className={link}
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Facebook
      </a>
    </div>
  );
}
