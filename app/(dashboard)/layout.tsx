import { Sidebar } from "@/components/layout/sidebar";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          {/* pt-14 en móvil deja espacio para el hamburger fijo */}
          <div className="mx-auto max-w-6xl px-4 py-5 pt-14 md:px-8 md:py-7 md:pt-7">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
