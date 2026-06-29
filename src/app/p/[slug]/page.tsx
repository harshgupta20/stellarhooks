import { type Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";

import { getPublicPaymentLink } from "@/server/services/payment-link-service";
import { buildStellarPaymentUri } from "@/lib/stellar";
import { rateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/constants";
import { PaymentPage } from "@/features/payment-links/components/payment-page";

async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? "unknown").trim();
}

function TooManyRequests() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-xl font-semibold">Too many requests</h1>
      <p className="text-sm text-muted-foreground">
        You&apos;ve loaded this page too many times. Please wait a moment and try again.
      </p>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const link = await getPublicPaymentLink(slug);
  if (!link) return { title: "Payment — StellarHooks" };
  return {
    title: `Pay ${link.product.name} — StellarHooks`,
    description: link.product.description ?? undefined,
  };
}

export default async function PublicPaymentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { limit, windowMs } = RATE_LIMITS.paymentPage;
  if (!rateLimit(`pay:${await clientIp()}`, limit, windowMs).ok) {
    return <TooManyRequests />;
  }

  const link = await getPublicPaymentLink(slug);
  if (!link) notFound();

  const uri = buildStellarPaymentUri({
    destination: link.walletAddress,
    assetCode: link.product.assetCode,
    assetIssuer: link.product.assetIssuer,
    amount: link.product.priceType === "FIXED" ? link.product.price : null,
    memo: link.memo,
  });

  const qrSvg = await QRCode.toString(uri, { type: "svg", margin: 1, errorCorrectionLevel: "M" });

  return <PaymentPage data={link} qrSvg={qrSvg} />;
}
