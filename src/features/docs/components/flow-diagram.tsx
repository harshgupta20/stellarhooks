import { Fragment } from "react";
import { ArrowRight, ArrowDown, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FlowNode {
  icon: LucideIcon;
  label: string;
  caption?: string;
  accent?: boolean;
}

function Connector() {
  return (
    <div className="flex items-center justify-center px-1 text-muted-foreground/60">
      <ArrowRight className="hidden size-4 md:block" />
      <ArrowDown className="size-4 md:hidden" />
    </div>
  );
}

/** A left-to-right (stacked on mobile) sequence of labeled nodes with arrows. */
export function FlowDiagram({ nodes }: { nodes: FlowNode[] }) {
  return (
    <div className="rounded-xl border bg-card/40 p-4">
      <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
        {nodes.map((node, i) => (
          <Fragment key={node.label}>
            <div
              className={cn(
                "flex flex-1 flex-col items-center gap-2 rounded-lg border bg-background p-3 text-center",
                node.accent && "border-primary/40 bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg border",
                  node.accent ? "border-primary/40 bg-primary text-primary-foreground" : "bg-card",
                )}
              >
                <node.icon className="size-4" />
              </span>
              <p className="text-sm font-medium leading-tight">{node.label}</p>
              {node.caption && (
                <p className="text-[11px] leading-tight text-muted-foreground">{node.caption}</p>
              )}
            </div>
            {i < nodes.length - 1 && <Connector />}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
