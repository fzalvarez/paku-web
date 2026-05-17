import type { Metadata } from "next";
import Script from "next/script";
import {
  HeroSectionV2,
  FeaturesBentoSection,
  SocialProofSection,
  ProcessSection,
  BannerStripe,
  ArticlesSection,
  AboutSection,
} from "@/components/sections/home";

export const metadata: Metadata = {
  title: "Grooming móvil para mascotas en Perú",
  description:
    "Agenda el servicio de grooming para tu mascota en segundos. Seguimiento en tiempo real, profesionales certificados y atención en la puerta de tu hogar en Lima y todo el Perú.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Paku — Grooming móvil para mascotas en Perú",
    description:
      "Agenda el servicio de grooming para tu mascota en segundos. Seguimiento en tiempo real y atención en la puerta de tu hogar.",
    url: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Paku",
  description:
    "Servicio de grooming móvil para mascotas en Lima y el Perú. Atención a domicilio con seguimiento en tiempo real.",
  url: "https://paku.com.pe",
  logo: "https://paku.com.pe/assets/imagotipo.png",
  image: "https://paku.com.pe/assets/og-image.png",
  telephone: "+51993019869",
  email: "admin@paku.com.pe",
  address: {
    "@type": "PostalAddress",
    addressCountry: "PE",
    addressLocality: "Lima",
    addressRegion: "Lima",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "-12.0464",
    longitude: "-77.0428",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "08:00",
    closes: "19:00",
  },
  sameAs: [
    "https://www.facebook.com/pakuperu",
    "https://www.instagram.com/pakuperu",
    "https://www.tiktok.com/@pakuperu",
  ],
  priceRange: "S/.",
};

export default function Home() {
  return (
    <>
      <Script
        id="json-ld-home"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSectionV2 />
      <FeaturesBentoSection />
      <SocialProofSection />
      <BannerStripe />
      <ProcessSection />
      <ArticlesSection />
      <AboutSection />
    </>
  );
}
