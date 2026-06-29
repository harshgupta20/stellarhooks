import { redirect } from "next/navigation";

import { getCurrentUser } from "@/server/auth/guards";
import { getMode } from "@/server/mode";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppTopbar } from "@/components/shared/app-topbar";
import { PageTransition } from "@/components/shared/page-transition";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const mode = await getMode();

  return (
    <div className="flex h-svh overflow-hidden">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar email={user.email} name={user.name} mode={mode} />
        {mode === "live" && (
          <div className="flex items-center justify-center gap-2 border-b border-warning/40 bg-warning/10 px-4 py-1.5 text-center text-xs font-medium text-warning">
            Live mode — actions use the Stellar mainnet and real funds.
          </div>
        )}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-6xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
