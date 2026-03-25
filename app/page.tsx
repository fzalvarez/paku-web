import type { Metadata } from "next";
import {
  HeroSection,
  PetManagementSection,
  BookingSection,
  ArticlesSection,
} from "@/components/sections/home";

export const metadata: Metadata = {
  title: "Inicio",
  description: "",
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <PetManagementSection />
      <BookingSection />
      <ArticlesSection />
    </>
  );
}
