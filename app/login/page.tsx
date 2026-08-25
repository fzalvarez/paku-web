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

  // Si el usuario cierra el modal sin completar el login (X, click afuera, Esc),
  // no lo dejamos varado en esta página vacía — lo regresamos al home.
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) router.push("/");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Acceso</h1>
      <AuthDialog open={open} onOpenChange={handleOpenChange} defaultTab="login" />
    </div>
  );
}
