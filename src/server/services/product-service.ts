import "server-only";

import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { assertWithinPlanLimit } from "@/server/services/plan-service";
import { isNativeAsset } from "@/lib/stellar";
import { NATIVE_ASSET } from "@/lib/constants";
import { buildPageMeta, type PageMeta, type PageParams } from "@/lib/pagination";
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/features/products/schemas";
import { type ProductDTO } from "@/features/products/types";
import { type Prisma } from "@/generated/prisma/client";

type ProductRow = Prisma.ProductModel & {
  wallet: { id: string; name: string; address: string; network: Prisma.WalletModel["network"] };
  _count: { paymentLinks: number };
};

const include = {
  wallet: { select: { id: true, name: true, address: true, network: true } },
  _count: { select: { paymentLinks: true } },
} as const;

function toDTO(p: ProductRow): ProductDTO {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
    assetCode: p.assetCode,
    assetIssuer: p.assetIssuer,
    priceType: p.priceType,
    price: p.price?.toString() ?? null,
    minAmount: p.minAmount?.toString() ?? null,
    active: p.active,
    wallet: p.wallet,
    paymentLinkCount: p._count.paymentLinks,
    createdAt: p.createdAt.toISOString(),
  };
}

async function assertWalletOwned(userId: string, walletId: string): Promise<void> {
  const wallet = await prisma.wallet.findFirst({ where: { id: walletId, userId }, select: { id: true } });
  if (!wallet) throw Errors.badRequest("Selected wallet was not found");
}

/** Normalize asset + price fields from validated input into persistable values. */
function assetAndPrice(input: CreateProductInput) {
  const native = isNativeAsset(input.assetCode);
  return {
    assetCode: native ? NATIVE_ASSET : input.assetCode.toUpperCase(),
    assetIssuer: native ? null : (input.assetIssuer || null),
    price: input.priceType === "FIXED" ? (input.price ?? null) : null,
    minAmount: input.priceType === "CUSTOM" ? (input.minAmount || null) : null,
  };
}

export interface ProductListOptions {
  active?: boolean;
  search?: string;
  network?: "TESTNET" | "PUBLIC";
  sortBy?: "createdAt" | "name";
  sortOrder?: "asc" | "desc";
}

export interface ListProductsResult {
  products: ProductDTO[];
  meta: PageMeta;
}

export async function listProducts(
  userId: string,
  params: PageParams,
  opts: ProductListOptions = {},
): Promise<ListProductsResult> {
  const where: Prisma.ProductWhereInput = {
    userId,
    ...(opts.active !== undefined ? { active: opts.active } : {}),
    ...(opts.search ? { name: { contains: opts.search, mode: "insensitive" } } : {}),
    ...(opts.network ? { wallet: { network: opts.network } } : {}),
  };
  const orderBy = { [opts.sortBy ?? "createdAt"]: opts.sortOrder ?? "desc" };

  const [rows, total] = await Promise.all([
    prisma.product.findMany({ where, include, orderBy, skip: params.skip, take: params.take }),
    prisma.product.count({ where }),
  ]);

  return { products: rows.map(toDTO), meta: buildPageMeta(params, total) };
}

async function findOwned(userId: string, id: string): Promise<ProductRow> {
  const product = await prisma.product.findFirst({ where: { id, userId }, include });
  if (!product) throw Errors.notFound("Product");
  return product;
}

export async function getProduct(userId: string, id: string): Promise<ProductDTO> {
  return toDTO(await findOwned(userId, id));
}

export async function createProduct(
  userId: string,
  input: CreateProductInput,
): Promise<ProductDTO> {
  const data = createProductSchema.parse(input);
  await assertWithinPlanLimit(userId, "products");
  await assertWalletOwned(userId, data.walletId);
  const normalized = assetAndPrice(data);

  const product = await prisma.product.create({
    data: {
      userId,
      walletId: data.walletId,
      name: data.name,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      priceType: data.priceType,
      active: data.active ?? true,
      ...normalized,
    },
    include,
  });
  return toDTO(product);
}

export async function updateProduct(
  userId: string,
  id: string,
  input: UpdateProductInput,
): Promise<ProductDTO> {
  const data = updateProductSchema.parse(input);
  const existing = await findOwned(userId, id);
  if (data.walletId) await assertWalletOwned(userId, data.walletId);

  // Re-normalize asset/price using the merged effective values.
  const merged = {
    assetCode: data.assetCode ?? existing.assetCode,
    assetIssuer: data.assetIssuer ?? existing.assetIssuer ?? "",
    priceType: data.priceType ?? existing.priceType,
    price: data.price ?? existing.price?.toString() ?? "",
    minAmount: data.minAmount ?? existing.minAmount?.toString() ?? "",
  } as CreateProductInput;
  const normalized = assetAndPrice(merged);

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description || null } : {}),
      ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl || null } : {}),
      ...(data.walletId !== undefined ? { walletId: data.walletId } : {}),
      ...(data.priceType !== undefined ? { priceType: data.priceType } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
      ...normalized,
    },
    include,
  });
  return toDTO(product);
}

export async function deleteProduct(userId: string, id: string): Promise<void> {
  await findOwned(userId, id);
  const payments = await prisma.payment.count({ where: { productId: id } });
  if (payments > 0) {
    throw Errors.conflict("This product has payment history. Deactivate it instead of deleting.");
  }
  await prisma.product.delete({ where: { id } });
}
