import "server-only";

import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { getEnv } from "@/lib/env";
import { generateSlug } from "@/lib/ids";
import { buildPageMeta, type PageMeta, type PageParams } from "@/lib/pagination";
import {
  type PaymentLinkDTO,
  type PublicPaymentLinkDTO,
} from "@/features/payment-links/types";
import { type Prisma } from "@/generated/prisma/client";

type LinkRow = Prisma.PaymentLinkModel & {
  product: {
    id: string;
    name: string;
    assetCode: string;
    priceType: Prisma.ProductModel["priceType"];
    price: Prisma.ProductModel["price"];
  };
  _count: { payments: number };
};

const include = {
  product: { select: { id: true, name: true, assetCode: true, priceType: true, price: true } },
  _count: { select: { payments: true } },
} as const;

function publicUrl(slug: string): string {
  return `${getEnv().APP_URL.replace(/\/$/, "")}/p/${slug}`;
}

function toDTO(link: LinkRow): PaymentLinkDTO {
  return {
    id: link.id,
    slug: link.slug,
    memo: link.memo,
    url: publicUrl(link.slug),
    active: link.active,
    paymentCount: link._count.payments,
    product: {
      id: link.product.id,
      name: link.product.name,
      assetCode: link.product.assetCode,
      priceType: link.product.priceType,
      price: link.product.price?.toString() ?? null,
    },
    createdAt: link.createdAt.toISOString(),
  };
}

export interface ListPaymentLinksResult {
  links: PaymentLinkDTO[];
  meta: PageMeta;
}

export async function listPaymentLinks(
  userId: string,
  params: PageParams,
  opts: { productId?: string; active?: boolean; network?: "TESTNET" | "PUBLIC" } = {},
): Promise<ListPaymentLinksResult> {
  const where: Prisma.PaymentLinkWhereInput = {
    userId,
    ...(opts.productId ? { productId: opts.productId } : {}),
    ...(opts.active !== undefined ? { active: opts.active } : {}),
    ...(opts.network ? { product: { wallet: { network: opts.network } } } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.paymentLink.findMany({
      where,
      include,
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    }),
    prisma.paymentLink.count({ where }),
  ]);
  return { links: rows.map(toDTO), meta: buildPageMeta(params, total) };
}

async function findOwned(userId: string, id: string): Promise<LinkRow> {
  const link = await prisma.paymentLink.findFirst({ where: { id, userId }, include });
  if (!link) throw Errors.notFound("Payment link");
  return link;
}

export async function getPaymentLink(userId: string, id: string): Promise<PaymentLinkDTO> {
  return toDTO(await findOwned(userId, id));
}

export async function createPaymentLink(
  userId: string,
  productId: string,
): Promise<PaymentLinkDTO> {
  const product = await prisma.product.findFirst({
    where: { id: productId, userId },
    select: { id: true },
  });
  if (!product) throw Errors.badRequest("Product not found");

  // Generate a unique slug/memo (retry on the rare collision).
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug(10);
    try {
      const link = await prisma.paymentLink.create({
        data: { userId, productId, slug, memo: slug },
        include,
      });
      return toDTO(link);
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") continue;
      throw err;
    }
  }
  throw Errors.internal("Could not generate a unique payment link");
}

export async function setPaymentLinkActive(
  userId: string,
  id: string,
  active: boolean,
): Promise<PaymentLinkDTO> {
  await findOwned(userId, id);
  const link = await prisma.paymentLink.update({ where: { id }, data: { active }, include });
  return toDTO(link);
}

export async function deletePaymentLink(userId: string, id: string): Promise<void> {
  await findOwned(userId, id);
  await prisma.paymentLink.delete({ where: { id } });
}

/** Public payment page data by slug. Returns null if missing or inactive. */
export async function getPublicPaymentLink(slug: string): Promise<PublicPaymentLinkDTO | null> {
  const link = await prisma.paymentLink.findUnique({
    where: { slug },
    include: { product: { include: { wallet: true } } },
  });
  if (!link || !link.active || !link.product.active) return null;

  const { product } = link;
  return {
    slug: link.slug,
    memo: link.memo,
    walletAddress: product.wallet.address,
    network: product.wallet.network,
    product: {
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      assetCode: product.assetCode,
      assetIssuer: product.assetIssuer,
      priceType: product.priceType,
      price: product.price?.toString() ?? null,
      minAmount: product.minAmount?.toString() ?? null,
    },
  };
}
