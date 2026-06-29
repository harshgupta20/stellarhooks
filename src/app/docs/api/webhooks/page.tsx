import { type Metadata } from "next";
import Link from "next/link";

import { DocHeader, H2, C } from "@/features/docs/components/prose";
import { Endpoint } from "@/features/docs/components/endpoint";
import { ParamsTable } from "@/features/docs/components/params-table";
import { CodeBlock } from "@/features/docs/components/code-block";
import { CodeTabs } from "@/features/docs/components/code-tabs";
import { Callout } from "@/features/docs/components/callout";
import { DocsPager } from "@/features/docs/components/docs-pager";

export const metadata: Metadata = { title: "Webhooks API" };

const createTabs = [
  {
    label: "cURL",
    code: `curl https://your-app.com/api/v1/webhooks \\
  -H "Authorization: Bearer $STELLARHOOKS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Payments",
    "url": "https://api.example.com/webhooks/stellarhooks",
    "events": ["payment.completed"]
  }'`,
  },
  {
    label: "JavaScript",
    code: `const res = await fetch("https://your-app.com/api/v1/webhooks", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.STELLARHOOKS_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Payments",
    url: "https://api.example.com/webhooks/stellarhooks",
    events: ["payment.completed"],
  }),
});
const { data: webhook } = await res.json();
// Store webhook.secret — it is only returned once.`,
  },
];

export default function WebhooksApiPage() {
  return (
    <article className="space-y-10">
      <DocHeader
        title="Webhooks"
        description="Register endpoints to receive signed events. Deliveries are retried automatically on failure."
      />

      <section className="space-y-4">
        <H2 id="object">The webhook object</H2>
        <ParamsTable
          params={[
            { name: "id", type: "string", description: "Unique identifier." },
            { name: "name", type: "string", description: "Label." },
            { name: "url", type: "string", description: "HTTPS endpoint to deliver to." },
            { name: "events", type: "string[]", description: <>Subscribed events, e.g. <C>payment.completed</C>.</> },
            { name: "status", type: '"ACTIVE" | "PAUSED"', description: "Delivery status." },
            { name: "secretMasked", type: "string", description: "Masked signing secret." },
            { name: "createdAt", type: "string", description: "ISO 8601 timestamp." },
          ]}
        />
      </section>

      <section className="space-y-4">
        <H2 id="create">Create a webhook</H2>
        <Endpoint method="POST" path="/api/v1/webhooks" />
        <ParamsTable
          params={[
            { name: "name", type: "string", required: true, description: "Label." },
            { name: "url", type: "string", required: true, description: "HTTPS endpoint URL." },
            { name: "events", type: "string[]", required: true, description: <>One or more of <C>payment.completed</C>, <C>payment.received</C>.</> },
          ]}
        />
        <CodeTabs tabs={createTabs} />
        <Callout variant="warn">
          The <C>secret</C> is returned <strong className="text-foreground">once</strong> in the
          create response. Store it to verify webhook signatures.
        </Callout>
      </section>

      <section className="space-y-4">
        <H2 id="manage">List, retrieve, delete</H2>
        <Endpoint method="GET" path="/api/v1/webhooks" />
        <Endpoint method="GET" path="/api/v1/webhooks/{id}" />
        <Endpoint method="PATCH" path="/api/v1/webhooks/{id}" />
        <Endpoint method="DELETE" path="/api/v1/webhooks/{id}" />
        <CodeBlock
          language="bash"
          code={`curl https://your-app.com/api/v1/webhooks \\
  -H "Authorization: Bearer $STELLARHOOKS_API_KEY"`}
        />
      </section>

      <Callout variant="info">
        For event payloads and signature verification, see{" "}
        <Link href="/docs/webhooks">Webhooks &amp; events</Link>.
      </Callout>

      <DocsPager />
    </article>
  );
}
