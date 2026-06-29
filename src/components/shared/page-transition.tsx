"use client";

import { usePathname } from "next/navigation";

/**
 * Re-mounts and replays a subtle fade/slide-in on every route change.
 * Pure CSS — no animation library.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}
