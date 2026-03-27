"use client";

import React from "react";
import {
  PetManagementSection,
  BookingSection,
  ArticlesSection,
} from "@/components/sections/home";

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Mi panel</h2>
      <PetManagementSection />
      <BookingSection />
      <ArticlesSection />
    </div>
  );
}
