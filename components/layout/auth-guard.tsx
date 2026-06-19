"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (!user?.is_superadmin) {
      const companies = user?.companies ?? [];
      if (companies.length === 1) router.replace(`/empresa/${companies[0].id}`);
      else if (companies.length > 1) router.replace("/seleccionar-empresa");
      else router.replace("/sin-acceso");
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated || !isAuthenticated || !user?.is_superadmin) return null;

  return <>{children}</>;
}
