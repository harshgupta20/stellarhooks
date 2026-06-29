import { CopyButton } from "@/components/shared/copy-button";

function CodeBody({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
      <code className="font-mono text-muted-foreground">
        {code.split("\n").map((line, i) => (
          <span key={i} className="block">
            {line || " "}
          </span>
        ))}
      </code>
    </pre>
  );
}

export function CodeBlock({
  code,
  language,
  filename,
}: {
  code: string;
  language?: string;
  filename?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card/60">
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2">
        {filename ? (
          <span className="font-mono text-xs text-muted-foreground">{filename}</span>
        ) : language ? (
          <span className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
            {language}
          </span>
        ) : null}
        <span className="ml-auto">
          <CopyButton value={code} label="Copy code" />
        </span>
      </div>
      <CodeBody code={code} />
    </div>
  );
}
