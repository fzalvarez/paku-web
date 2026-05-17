import type { Metadata } from "next";
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
  title: "Inicio",
  description: "",
};

export default function Home() {
  return (
    <>
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
