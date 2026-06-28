import { Sidebar } from "@/components/layout/sidebar";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        {/* En móvil: flex-col con top bar arriba y contenido abajo */}
        <div className="flex flex-1 flex-col overflow-hidden lg:contents">
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="mx-auto max-w-6xl px-4 py-5 md:px-8 md:py-7">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
