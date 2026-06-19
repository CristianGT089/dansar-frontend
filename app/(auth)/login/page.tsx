"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError("");
    try {
      const { data: tokens } = await api.post("/auth/login", data);
      setTokens(tokens.access_token, tokens.refresh_token);
      const { data: me } = await api.get("/auth/me");
      setUser(me);

      if (me.is_superadmin) router.replace("/admin");
      else if (me.companies.length === 0) router.replace("/sin-acceso");
      else if (me.companies.length === 1) router.replace(`/empresa/${me.companies[0].id}`);
      else router.replace("/seleccionar-empresa");
    } catch {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.");
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Panel izquierdo — marca */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-sidebar border-r border-sidebar-border p-12">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">
              DS
            </div>
            <span className="text-base font-semibold text-white/90">Dan-Sar Contable</span>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-3xl font-bold text-white/90 leading-snug">
            Gestión contable<br />
            <span className="text-primary">para empresas modernas</span>
          </p>
          <p className="text-sm text-white/40 max-w-xs leading-relaxed">
            Análisis financiero, P&G, libro mayor y más — todo en un solo lugar.
          </p>
        </div>
        <p className="text-[11px] text-white/20">© {new Date().getFullYear()} Dan-Sar Contable</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6 animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
              DS
            </div>
            <span className="text-sm font-semibold">Dan-Sar Contable</span>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">Inicia sesión</h1>
            <p className="mt-1 text-sm text-muted-foreground">Accede a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Email</Label>
              <Input
                id="email" type="email" placeholder="correo@empresa.com"
                autoComplete="email" className="h-9 text-sm"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">Contraseña</Label>
              <Input
                id="password" type="password" autoComplete="current-password"
                className="h-9 text-sm"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <p className="rounded-md border border-destructive/20 bg-destructive/8 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-9 text-sm font-medium" disabled={isSubmitting}>
              {isSubmitting ? "Verificando..." : "Ingresar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
