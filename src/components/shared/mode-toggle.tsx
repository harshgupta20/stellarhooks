"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Radio } from "lucide-react";

import { cn } from "@/lib/utils";
import { MODE_COOKIE, type AppMode } from "@/lib/mode";

function setModeCookie(mode: AppMode) {
  document.cookie = `${MODE_COOKIE}=${mode};path=/;max-age=31536000;samesite=lax`;
}

/** Stripe-style Test / Live switch. Live is highlighted to signal real funds. */
export function ModeToggle({ mode }: { mode: AppMode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const select = (next: AppMode) => {
    if (next === mode) return;
    setModeCookie(next);
    startTransition(() => router.refresh());
  };

  return (
    <div
      className={cn(
        "flex items-center rounded-full border p-0.5 text-xs font-medium transition-opacity",
        pending && "opacity-60",
        mode === "live" ? "border-warning/50 bg-warning/10" : "border-border bg-muted/40",
      )}
      role="group"
      aria-label="Test or live mode"
    >
      <button
        type="button"
        onClick={() => select("test")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors",
          mode === "test"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <FlaskConical className="size-3.5" />
        Test
      </button>
      <button
        type="button"
        onClick={() => select("live")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors",
          mode === "live"
            ? "bg-warning text-warning-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Radio className="size-3.5" />
        Live
      </button>
    </div>
  );
}
