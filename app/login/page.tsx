"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/common/AuthDialog";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const [open, setOpen] = useState(true);

  if (isAuthenticated) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Acceso</h1>
      <AuthDialog open={open} onOpenChange={setOpen} defaultTab="login" />
    </div>
  );
}
