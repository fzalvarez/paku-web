import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://paku.com.pe"),
  title: {
    default: "Paku — Grooming móvil para mascotas en Perú",
    template: "%s | Paku",
  },
  description:
    "Paku es el servicio de grooming móvil más moderno del Perú. Agenda en segundos, sigue el proceso en tiempo real y recibe a tu mascota en la puerta de tu hogar.",
  keywords: [
    "grooming móvil",
    "grooming mascotas Lima",
    "baño a domicilio mascotas",
    "peluquería canina Lima",
    "grooming perros Peru",
    "Paku",
    "cuidado mascotas Perú",
  ],
  authors: [{ name: "Paku", url: "https://paku.com.pe" }],
  creator: "Paku",
  publisher: "Paku",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "Paku",
    title: "Paku — Grooming móvil para mascotas en Perú",
    description:
      "Agenda el grooming de tu mascota en segundos. Seguimiento en tiempo real y atención en la puerta de tu hogar.",
    images: [
      {
        url: "/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "Paku — Grooming móvil para mascotas en Perú",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paku — Grooming móvil para mascotas en Perú",
    description:
      "Agenda el grooming de tu mascota en segundos. Seguimiento en tiempo real y atención en la puerta de tu hogar.",
    images: ["/assets/og-image.png"],
  },
  icons: {
    icon: "/assets/favicon.png",
    shortcut: "/assets/favicon.png",
    apple: "/assets/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable
      )}
    >
      <body className="flex min-h-screen flex-col font-sans">
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
