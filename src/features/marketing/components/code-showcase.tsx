import { SectionHeading } from "@/features/marketing/components/section-heading";
import { Reveal } from "@/features/marketing/components/reveal";
import { CopyButton } from "@/components/shared/copy-button";

const PAYLOAD = `{
  "id": "evt_8Hk2…",
  "type": "payment.received",
  "createdAt": "2026-06-26T12:00:00.000Z",
  "data": {
    "wallet": { "id": "wal_…", "address": "GABC…7X" },
    "amount": "250.0000000",
    "asset": "XLM",
    "from": "GD…",
    "to": "GABC…7X",
    "transactionHash": "f6afcc6b…"
  }
}`;

const VERIFY = `import crypto from "node:crypto";

// Verify the request really came from StellarHooks
function verify(secret, timestamp, rawBody, header) {
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret)
      .update(\`\${timestamp}.\${rawBody}\`)
      .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(header),
  );
}`;

function CodeCard({
  filename,
  code,
  language,
}: {
  filename: string;
  code: string;
  language: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card/60 backdrop-blur">
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-destructive/50" />
        <span className="size-2.5 rounded-full bg-warning/50" />
        <span className="size-2.5 rounded-full bg-success/50" />
        <span className="ml-2 font-mono text-xs text-muted-foreground">{filename}</span>
        <span className="ml-auto flex items-center gap-2">
          <span className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
            {language}
          </span>
          <CopyButton value={code} label="Copy code" />
        </span>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-muted-foreground [&_.k]:text-foreground [&_.s]:text-success">
          {code.split("\n").map((line, i) => (
            <span key={i} className="block">
              {line || " "}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export function CodeShowcase() {
  return (
    <section id="developers" className="px-6 py-24">
      <SectionHeading
        eyebrow="Built for developers"
        title="A payload you'll enjoy handling"
        subtitle="Clean JSON. Signed headers. Verify in 5 lines."
      />

      <div className="mx-auto mt-14 grid max-w-5xl gap-4 lg:grid-cols-2">
        <Reveal direction="left">
          <CodeCard filename="POST /your-webhook" code={PAYLOAD} language="json" />
        </Reveal>
        <Reveal direction="right" delay={100}>
          <CodeCard filename="verify.ts" code={VERIFY} language="ts" />
        </Reveal>
      </div>
    </section>
  );
}
