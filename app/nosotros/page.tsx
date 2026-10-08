import type { Metadata } from "next";
import { AboutSection, FinalCtaSection, VanSection } from "@/components/sections/home";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce Paku: grooming móvil que combina tecnología y servicio para cuidar a tu mascota en la puerta de tu casa.",
  alternates: { canonical: "/nosotros" },
};

export default function NosotrosPage() {
  return (
    <>
      <AboutSection />
      <VanSection />
      <FinalCtaSection />
    </>
  );
}
