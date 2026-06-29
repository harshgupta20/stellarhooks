import Link from "next/link";
import { Webhook } from "lucide-react";

import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export function Logo({
  href = "/",
  className,
  showName = true,
}: {
  href?: string;
  className?: string;
  showName?: boolean;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold", className)}>
      <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
        <Webhook className="size-4" />
      </span>
      {showName && <span className="tracking-tight">{APP_NAME}</span>}
    </Link>
  );
}
