import { CompanyGuard } from "@/components/layout/company-guard";
import { CompanySidebar } from "@/components/layout/company-sidebar";

export default function EmpresaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { companyId: string };
}) {
  return (
    <CompanyGuard companyId={params.companyId}>
      <div className="flex h-screen overflow-hidden">
        <CompanySidebar companyId={params.companyId} />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-6xl px-8 py-7">{children}</div>
        </main>
      </div>
    </CompanyGuard>
  );
}
