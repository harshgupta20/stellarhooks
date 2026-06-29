import { redirect } from "next/navigation";

import { getCurrentUser } from "@/server/auth/guards";
import { Logo } from "@/components/shared/logo";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-4 py-12">
      <Logo />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
