import { cn } from "@/lib/utils";

type Method = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";

const METHOD_STYLES: Record<Method, string> = {
  GET: "bg-success/15 text-success",
  POST: "bg-primary/15 text-primary",
  PATCH: "bg-warning/15 text-warning",
  PUT: "bg-warning/15 text-warning",
  DELETE: "bg-destructive/15 text-destructive",
};

/** Renders a colored HTTP method + path, e.g. `POST /api/v1/products`. */
export function Endpoint({ method, path }: { method: Method; path: string }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto rounded-lg border bg-muted/40 px-3 py-2">
      <span
        className={cn(
          "shrink-0 rounded px-2 py-0.5 font-mono text-xs font-semibold",
          METHOD_STYLES[method],
        )}
      >
        {method}
      </span>
      <code className="whitespace-nowrap font-mono text-sm text-foreground">{path}</code>
    </div>
  );
}
