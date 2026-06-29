import { type Metadata } from "next";
import Link from "next/link";

import { DocHeader, H2, P, C } from "@/features/docs/components/prose";
import { Callout } from "@/features/docs/components/callout";
import { CodeBlock } from "@/features/docs/components/code-block";
import { DocsPager } from "@/features/docs/components/docs-pager";

export const metadata: Metadata = { title: "Authentication" };

export default function AuthenticationPage() {
  return (
    <article className="space-y-8">
      <DocHeader
        title="Authentication"
        description="The API authenticates with a secret API key sent as a Bearer token."
      />

      <div className="space-y-4">
        <H2 id="keys">API keys</H2>
        <P>
          Create and revoke keys in the dashboard under{" "}
          <Link href="/dashboard/api-keys" className="text-foreground underline">
            API Keys
          </Link>
          . Keys begin with <C>sk_</C> and are shown only once at creation — store them securely and
          never expose them in client-side code.
        </P>
      </div>

      <div className="space-y-4">
        <H2 id="bearer">Authorization header</H2>
        <P>Send your key in the Authorization header on every request:</P>
        <CodeBlock
          language="bash"
          code={`curl https://your-app.com/api/v1/products \\
  -H "Authorization: Bearer sk_your_key_here"`}
        />
        <P>
          Alternatively, the key may be passed in an <C>x-api-key</C> header.
        </P>
      </div>

      <Callout variant="warn">
        Keep API keys server-side. Anyone with a key has full access to your products, payments, and
        webhooks. Rotate immediately if a key leaks by revoking it in the dashboard.
      </Callout>

      <div className="space-y-4">
        <H2 id="errors">Unauthorized responses</H2>
        <P>
          Requests with a missing or invalid key return <C>401 Unauthorized</C>:
        </P>
        <CodeBlock
          language="json"
          code={`{
  "data": null,
  "error": { "message": "Invalid API key", "code": "unauthorized" }
}`}
        />
      </div>

      <DocsPager />
    </article>
  );
}
