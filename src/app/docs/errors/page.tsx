import { type Metadata } from "next";

import { DocHeader, H2, P, C } from "@/features/docs/components/prose";
import { CodeBlock } from "@/features/docs/components/code-block";
import { ParamsTable } from "@/features/docs/components/params-table";
import { DocsPager } from "@/features/docs/components/docs-pager";

export const metadata: Metadata = { title: "Errors & pagination" };

const successEnvelope = `{
  "data": { /* resource */ },
  "error": null
}`;

const errorEnvelope = `{
  "data": null,
  "error": {
    "message": "A price greater than 0 is required for fixed-price products",
    "code": "validation_error",
    "details": [ /* field issues */ ]
  }
}`;

const listEnvelope = `{
  "data": [ /* items */ ],
  "meta": { "page": 1, "pageSize": 20, "total": 42, "totalPages": 3 },
  "error": null
}`;

export default function ErrorsPage() {
  return (
    <article className="space-y-10">
      <DocHeader
        title="Errors & pagination"
        description="Response envelopes, error codes, and how list endpoints paginate."
      />

      <section className="space-y-4">
        <H2 id="envelope">Response envelope</H2>
        <P>Every successful response wraps the result in a consistent envelope:</P>
        <CodeBlock language="json" code={successEnvelope} />
      </section>

      <section className="space-y-4">
        <H2 id="errors">Errors</H2>
        <P>
          Errors return a non-2xx status with an <C>error</C> object. <C>details</C> is present for
          validation errors.
        </P>
        <CodeBlock language="json" code={errorEnvelope} />
        <ParamsTable
          params={[
            { name: "400", type: "bad_request", description: "Malformed or invalid request." },
            { name: "401", type: "unauthorized", description: "Missing or invalid API key." },
            { name: "404", type: "not_found", description: "Resource does not exist or isn't yours." },
            { name: "409", type: "conflict", description: "Conflicting state (e.g. deleting a product with payments)." },
            { name: "422", type: "validation_error", description: "Body failed schema validation; see details." },
            { name: "500", type: "internal", description: "Unexpected server error." },
          ]}
        />
      </section>

      <section className="space-y-4">
        <H2 id="pagination">Pagination</H2>
        <P>
          List endpoints accept <C>page</C> (default 1) and <C>pageSize</C> (default 20, max 100),
          and return a <C>meta</C> object alongside <C>data</C>.
        </P>
        <CodeBlock language="json" code={listEnvelope} />
        <CodeBlock
          language="bash"
          code={`curl "https://your-app.com/api/v1/payments?page=2&pageSize=50" \\
  -H "Authorization: Bearer $STELLARHOOKS_API_KEY"`}
        />
      </section>

      <DocsPager />
    </article>
  );
}
