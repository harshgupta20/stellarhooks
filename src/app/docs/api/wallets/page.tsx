import { type Metadata } from "next";

import { DocHeader, H2, P, C } from "@/features/docs/components/prose";
import { Endpoint } from "@/features/docs/components/endpoint";
import { ParamsTable } from "@/features/docs/components/params-table";
import { CodeTabs } from "@/features/docs/components/code-tabs";
import { DocsPager } from "@/features/docs/components/docs-pager";

export const metadata: Metadata = { title: "Wallets API" };

const createTabs = [
  {
    label: "cURL",
    code: `curl https://your-app.com/api/v1/wallets \\
  -H "Authorization: Bearer $STELLARHOOKS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Treasury",
    "address": "GABC...XYZ",
    "network": "TESTNET"
  }'`,
  },
  {
    label: "JavaScript",
    code: `const res = await fetch("https://your-app.com/api/v1/wallets", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.STELLARHOOKS_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name: "Treasury", address: "GABC...XYZ", network: "TESTNET" }),
});
const { data: wallet } = await res.json();`,
  },
];

export default function WalletsApiPage() {
  return (
    <article className="space-y-10">
      <DocHeader
        title="Wallets"
        description="Monitor a Stellar address for incoming payments. Products receive into a wallet."
      />

      <section className="space-y-4">
        <H2 id="object">The wallet object</H2>
        <ParamsTable
          params={[
            { name: "id", type: "string", description: "Unique identifier." },
            { name: "name", type: "string", description: "Label." },
            { name: "address", type: "string", description: "Stellar public key (G...)." },
            { name: "network", type: '"TESTNET" | "PUBLIC"', description: "Stellar network." },
            { name: "status", type: '"ACTIVE" | "PAUSED"', description: "Monitoring status." },
            { name: "lastSyncAt", type: "string | null", description: "Last poll time." },
            { name: "createdAt", type: "string", description: "ISO 8601 timestamp." },
          ]}
        />
      </section>

      <section className="space-y-4">
        <H2 id="create">Watch a wallet</H2>
        <Endpoint method="POST" path="/api/v1/wallets" />
        <ParamsTable
          params={[
            { name: "name", type: "string", required: true, description: "Label." },
            { name: "address", type: "string", required: true, description: "Stellar public key." },
            { name: "network", type: '"TESTNET" | "PUBLIC"', required: true, description: "Network." },
          ]}
        />
        <CodeTabs tabs={createTabs} />
        <P>
          Only payments that arrive <strong className="text-foreground">after</strong> the wallet is
          added are detected — we start watching from the latest ledger.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="manage">List, retrieve, delete</H2>
        <Endpoint method="GET" path="/api/v1/wallets" />
        <Endpoint method="GET" path="/api/v1/wallets/{id}" />
        <Endpoint method="PATCH" path="/api/v1/wallets/{id}" />
        <Endpoint method="DELETE" path="/api/v1/wallets/{id}" />
        <P>
          <C>PATCH</C> updates the name or <C>status</C>; <C>DELETE</C> stops monitoring.
        </P>
      </section>

      <DocsPager />
    </article>
  );
}
