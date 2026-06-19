"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCompany } from "@/lib/queries/companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  legal_name: z.string().optional(),
  tax_id: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSuccess: () => void;
}

export function CompanyForm({ onSuccess }: Props) {
  const createCompany = useCreateCompany();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await createCompany.mutateAsync(data);
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError("root", { message: msg ?? "Error al crear la empresa" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nombre *</Label>
        <Input placeholder="Empresa S.A.S." {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Razón social</Label>
        <Input placeholder="Empresa S.A.S." {...register("legal_name")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>NIT</Label>
          <Input placeholder="900123456-1" {...register("tax_id")} />
        </div>
        <div className="space-y-1.5">
          <Label>Teléfono</Label>
          <Input placeholder="+57 300 000 0000" {...register("phone")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input type="email" placeholder="contacto@empresa.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Dirección</Label>
        <Input placeholder="Calle 123 #45-67, Bogotá" {...register("address")} />
      </div>

      {errors.root && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.root.message}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting || createCompany.isPending}>
          {createCompany.isPending ? "Creando..." : "Crear empresa"}
        </Button>
      </div>
    </form>
  );
}
