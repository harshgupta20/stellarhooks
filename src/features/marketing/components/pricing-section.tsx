import Link from "next/link";
import { Check, ArrowRight, Mail, ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  PLANS,
  PLAN_LABELS,
  PLAN_RESOURCES,
  RESOURCE_LABELS,
  RATE_LIMITS,
  formatLimit,
  type PlanTier,
} from "@/lib/constants";
import { getEffectiveLimits } from "@/server/services/plan-limits-service";
import { SectionHeading } from "@/features/marketing/components/section-heading";
import { Reveal } from "@/features/marketing/components/reveal";

// Update these to your real contact channels.
const CONTACT = {
  email: "edusystempro2@gmail.com",
  linkedin: "https://www.linkedin.com/",
  twitter: "https://x.com/",
};

const PERKS: Record<PlanTier, string[]> = {
  FREE: [
    "Hosted payment pages + QR",
    "Signed webhooks with retries",
    `${RATE_LIMITS.api.limit} API requests / min`,
    "Testnet & mainnet",
    "Community support",
  ],
  PRO: ["Everything in Free", "Higher API rate limits", "Priority support"],
  SCALE: ["Everything in Pro", "Onboarding & integration help", "Dedicated support & SLA"],
};

const TAGLINE: Record<PlanTier, string> = {
  FREE: "Build and ship on us.",
  PRO: "For growing products.",
  SCALE: "For startups going big.",
};

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <Check className="mt-0.5 size-4 shrink-0 text-success" />
      <span className="text-muted-foreground">{children}</span>
    </li>
  );
}

export async function PricingSection() {
  const limits = await getEffectiveLimits();

  return (
    <section id="pricing" className="px-6 py-24">
      <SectionHeading
        eyebrow="Pricing"
        title="Start free. Scale when you need to."
        subtitle="Generous free tier. Upgrade by reaching out — we onboard you personally."
      />

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
        {PLANS.map((plan, i) => {
          const highlight = plan === "PRO";
          return (
            <Reveal key={plan} delay={i * 90}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border bg-card/50 p-6",
                  highlight && "border-primary/40 shadow-xl",
                )}
              >
                {highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                    Popular
                  </span>
                )}
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">{PLAN_LABELS[plan]}</h3>
                  <p className="text-sm text-muted-foreground">{TAGLINE[plan]}</p>
                  <p className="pt-1 text-2xl font-semibold tracking-tight">
                    {plan === "FREE" ? "$0" : "Let's talk"}
                  </p>
                </div>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {PLAN_RESOURCES.map((resource) => (
                    <FeatureItem key={resource}>
                      {formatLimit(limits[plan][resource])} {RESOURCE_LABELS[resource]}
                    </FeatureItem>
                  ))}
                  {PERKS[plan].map((perk) => (
                    <FeatureItem key={perk}>{perk}</FeatureItem>
                  ))}
                </ul>

                <div className="mt-6">
                  {plan === "FREE" ? (
                    <Button asChild className="w-full rounded-full">
                      <Link href="/register">
                        Start free
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full rounded-full" variant={highlight ? "default" : "outline"}>
                      <a href={`mailto:${CONTACT.email}?subject=StellarHooks%20${PLAN_LABELS[plan]}`}>
                        <Mail className="size-4" />
                        Get in touch
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-muted-foreground">
        Prefer DMs? Reach out on
        <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-foreground underline">
          LinkedIn <ExternalLink className="size-3" />
        </a>
        or
        <a href={CONTACT.twitter} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-foreground underline">
          X <ExternalLink className="size-3" />
        </a>
        — no checkout, just a conversation.
      </p>
    </section>
  );
}
