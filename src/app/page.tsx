import { getCurrentUser } from "@/server/auth/guards";
import { LandingNav } from "@/features/marketing/components/landing-nav";
import { HeroSection } from "@/features/marketing/components/hero-section";
import { TechMarquee } from "@/features/marketing/components/tech-marquee";
import { TransactionFeed } from "@/features/marketing/components/transaction-feed";
import { FeaturesBento } from "@/features/marketing/components/features-bento";
import { PaymentShowcase } from "@/features/marketing/components/payment-showcase";
import { HowItWorks } from "@/features/marketing/components/how-it-works";
import { SimpleDemoSection } from "@/features/marketing/components/simple-demo-section";
import { CodeShowcase } from "@/features/marketing/components/code-showcase";
import { SdkSection } from "@/features/marketing/components/sdk-section";
import { PricingSection } from "@/features/marketing/components/pricing-section";
import { StatsBand } from "@/features/marketing/components/stats-band";
import { CtaSection } from "@/features/marketing/components/cta-section";
import { SiteFooter } from "@/features/marketing/components/site-footer";

export default async function LandingPage() {
  const user = await getCurrentUser();
  const authed = user !== null;

  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden">
      <LandingNav authed={authed} />
      <main className="flex-1">
        <HeroSection authed={authed} />
        <TechMarquee />
        <TransactionFeed />
        <FeaturesBento />
        <PaymentShowcase />
        <HowItWorks />
        <SimpleDemoSection />
        <CodeShowcase />
        <SdkSection />
        <StatsBand />
        <PricingSection />
        <CtaSection authed={authed} />
      </main>
      <SiteFooter />
    </div>
  );
}
