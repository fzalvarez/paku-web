import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_STORE_LINKS } from "@/constants";

const APP_STORE_BUTTONS = [
  {
    id: "google-play",
    href: APP_STORE_LINKS.googlePlay,
    src: "/assets/android-play-store.png",
    alt: "Disponible en Google Play",
  },
  {
    id: "app-store",
    href: APP_STORE_LINKS.appStore,
    src: "/assets/apple-app-store.png",
    alt: "Consíguelo en el App Store",
  },
] as const;

/** Insignias de Google Play y App Store (hero y "¿Cómo funciona?"). */
export function AppStoreButtons({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 sm:gap-3", className)}>
      {APP_STORE_BUTTONS.map((btn) => (
        <Link key={btn.id} href={btn.href} className="transition-all hover:scale-105 hover:opacity-90">
          <Image
            src={btn.src}
            alt={btn.alt}
            width={180}
            height={53}
            className="h-11 w-auto object-contain sm:h-14 md:h-16"
          />
        </Link>
      ))}
    </div>
  );
}
