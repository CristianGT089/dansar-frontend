"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";
import { useCompanyStore } from "@/lib/stores/company";

interface CompanyGuardProps {
  companyId: string;
  children: React.ReactNode;
}

export function CompanyGuard({ companyId, children }: CompanyGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user, hasCompanyAccess, companies } = useAuthStore();
  const { setActiveCompany } = useCompanyStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (!hasCompanyAccess(companyId)) { router.replace("/seleccionar-empresa"); return; }

    const company = companies().find((c) => c.id === companyId) ?? null;
    setActiveCompany(company);
  }, [hydrated, isAuthenticated, companyId, hasCompanyAccess, companies, setActiveCompany, router]);

  if (!hydrated || !isAuthenticated) return null;
  if (!hasCompanyAccess(companyId)) return null;

  return <>{children}</>;
}
