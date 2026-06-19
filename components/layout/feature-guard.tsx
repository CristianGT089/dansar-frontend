"use client";

import { Lock } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";

interface FeatureGuardProps {
  companyId: string;
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGuard({ companyId, feature, children, fallback }: FeatureGuardProps) {
  const { hasFeature } = useAuthStore();

  if (!hasFeature(companyId, feature)) {
    return fallback ?? (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 p-12 text-center">
        <Lock className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">
          Esta funcionalidad no está disponible en el plan actual.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
