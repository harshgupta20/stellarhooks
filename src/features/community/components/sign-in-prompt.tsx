import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Shown to anonymous visitors in place of the ask/comment forms. */
export function SignInPrompt({ action }: { action: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 text-center sm:flex-row sm:justify-between sm:text-left">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Sign in</span> to {action}. Reading is open to
        everyone.
      </p>
      <div className="flex gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/register">Create account</Link>
        </Button>
      </div>
    </div>
  );
}
