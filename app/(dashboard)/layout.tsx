import { Sidebar } from "@/components/layout/sidebar";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {/* flex-col en móvil: top bar arriba, contenido abajo. flex-row en lg: sidebar al lado */}
      <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-6xl px-4 py-5 md:px-8 md:py-7">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
