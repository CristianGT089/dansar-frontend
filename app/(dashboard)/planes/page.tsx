"use client";

import { CreditCard, CheckCircle2 } from "lucide-react";
import { usePlans } from "@/lib/queries/plans";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const planColors: Record<string, string> = {
  basic: "border-gray-200",
  professional: "border-blue-300",
  enterprise: "border-purple-400",
};

const planBadge: Record<string, "secondary" | "default" | "outline"> = {
  basic: "secondary",
  professional: "default",
  enterprise: "outline",
};

export default function PlanesPage() {
  const { data: plans, isLoading } = usePlans();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Planes</h1>
        <p className="text-muted-foreground">Planes disponibles para las empresas en la plataforma</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="h-32" /></Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {plans?.map((plan) => (
            <Card key={plan.id} className={`border-2 ${planColors[plan.type] ?? ""}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <Badge variant={planBadge[plan.type] ?? "secondary"}>
                    {plan.type}
                  </Badge>
                </div>
                <CardTitle className="mt-2">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{plan.is_active ? "Disponible" : "No disponible"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
