"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/shared/copy-button";

export interface CodeTab {
  label: string;
  code: string;
}

/** Multi-language code sample with a tab per language. */
export function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [active, setActive] = useState(0);
  const current = tabs[active] ?? tabs[0];

  return (
    <div className="overflow-hidden rounded-xl border bg-card/60">
      <div className="flex items-center gap-1 border-b bg-muted/40 px-2 py-1.5">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition-colors",
              i === active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
        <span className="ml-auto">
          <CopyButton value={current.code} label="Copy code" />
        </span>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-muted-foreground">
          {current.code.split("\n").map((line, i) => (
            <span key={i} className="block">
              {line || " "}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
