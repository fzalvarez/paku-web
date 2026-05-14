import type { Metadata } from "next";
import {
  HeroSectionV2,
  FeaturesBentoSection,
  SocialProofSection,
  BannerStripe,
  ProcessSection,
  AboutSection,
} from "@/components/sections/home";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Paku — Cuidado inteligente para tu mascota",
};

export default function HomeV2() {
  return (
    <>
      <HeroSectionV2 />
      <FeaturesBentoSection />
      <SocialProofSection />
      <BannerStripe />
      <ProcessSection />
      <AboutSection />
    </>
  );
}
