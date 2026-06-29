import { type Metadata } from "next";

import { DocHeader, H2, P, C } from "@/features/docs/components/prose";
import { ParamsTable } from "@/features/docs/components/params-table";
import { CodeBlock } from "@/features/docs/components/code-block";
import { Callout } from "@/features/docs/components/callout";
import { DocsPager } from "@/features/docs/components/docs-pager";
import {
  PLAN_RESOURCES,
  PLAN_LABELS,
  RESOURCE_LABELS,
  RATE_LIMITS,
  formatLimit,
} from "@/lib/constants";
import { getEffectiveLimits } from "@/server/services/plan-limits-service";

export const metadata: Metadata = { title: "Limits & plans" };

const rateLimitError = `{
  "data": null,
  "error": {
    "message": "Rate limit exceeded (${RATE_LIMITS.api.limit} requests/min). Retry in 30s.",
    "code": "rate_limited"
  }
}`;

export default async function LimitsPage() {
  const limits = await getEffectiveLimits();
  return (
    <article className="space-y-10">
      <DocHeader
        title="Limits & plans"
        description="Plan resource limits, API rate limits, and how to upgrade."
      />

      <section className="space-y-4">
        <H2 id="plans">Plans</H2>
        <P>
          Every account starts on the <strong className="text-foreground">Free</strong> plan.{" "}
          <strong className="text-foreground">Pro</strong> and{" "}
          <strong className="text-foreground">Scale Startup</strong> raise resource caps — there&apos;s
          no self-serve checkout; reach out and we&apos;ll upgrade you.
        </P>
        <ParamsTable
          params={[
            ...PLAN_RESOURCES.map((resource) => ({
              name: RESOURCE_LABELS[resource].replace(/^\w/, (c) => c.toUpperCase()),
              type: "resource",
              description: (
                <>
                  {PLAN_LABELS.FREE}: {formatLimit(limits.FREE[resource])} · {PLAN_LABELS.PRO}:{" "}
                  {formatLimit(limits.PRO[resource])} · {PLAN_LABELS.SCALE}:{" "}
                  {formatLimit(limits.SCALE[resource])}
                </>
              ),
            })),
            { name: "Payment links", type: "resource", description: "Unlimited on all plans." },
          ]}
        />
        <P>
          Exceeding a plan cap returns <C>403 forbidden</C> with a message explaining the limit.
          Deactivate unused resources or upgrade your plan.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="rate-limits">Rate limits</H2>
        <P>
          The API is rate limited per API key (or per session) to{" "}
          <strong className="text-foreground">
            {RATE_LIMITS.api.limit} requests per minute
          </strong>
          . Limits are lenient and only intended to prevent abuse. Over the limit returns{" "}
          <C>429 rate_limited</C>:
        </P>
        <CodeBlock language="json" code={rateLimitError} />
        <P>
          The hosted payment page (<C>/p/&lt;slug&gt;</C>) is rate limited per IP at{" "}
          <strong className="text-foreground">
            {RATE_LIMITS.paymentPage.limit} requests per minute
          </strong>
          , high enough to comfortably serve large audiences while blocking abuse.
        </P>
        <Callout variant="info">
          Build retries with backoff into your integration. If you hit <C>429</C>, wait and retry —
          limits reset on a rolling one-minute window.
        </Callout>
      </section>

      <section className="space-y-4">
        <H2 id="upgrade">Upgrading to Pro</H2>
        <P>
          Pro is a conversation, not a checkout. Email us or DM on LinkedIn / X from the{" "}
          <strong className="text-foreground">Pricing</strong> section on the homepage and we&apos;ll
          get you set up with unlimited resources and higher limits.
        </P>
      </section>

      <DocsPager />
    </article>
  );
}
