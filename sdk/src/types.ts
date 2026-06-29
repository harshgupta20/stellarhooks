/** Shared types for the StellarPlatform SDK. */

export type Network = "TESTNET" | "PUBLIC";
export type PriceType = "FIXED" | "CUSTOM";
export type PaymentStatus = "PENDING" | "CONFIRMED" | "FAILED";
export type WalletStatus = "ACTIVE" | "PAUSED";
export type WebhookStatus = "ACTIVE" | "PAUSED";

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
}

// ---- Products ----

export interface ProductWalletRef {
  id: string;
  name: string;
  address: string;
  network: Network;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  assetCode: string;
  assetIssuer: string | null;
  priceType: PriceType;
  price: string | null;
  minAmount: string | null;
  active: boolean;
  wallet: ProductWalletRef;
  paymentLinkCount: number;
  createdAt: string;
}

export interface CreateProductInput {
  name: string;
  walletId: string;
  assetCode: string;
  priceType: PriceType;
  description?: string;
  imageUrl?: string;
  assetIssuer?: string;
  /** Required when priceType is "FIXED". */
  price?: string;
  /** Optional minimum when priceType is "CUSTOM". */
  minAmount?: string;
  active?: boolean;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductListParams extends ListParams {
  active?: boolean;
  search?: string;
  sortBy?: "createdAt" | "name";
  sortOrder?: "asc" | "desc";
}

// ---- Payment links ----

export interface PaymentLink {
  id: string;
  slug: string;
  memo: string;
  url: string;
  active: boolean;
  paymentCount: number;
  product: { id: string; name: string; assetCode: string; priceType: PriceType; price: string | null };
  createdAt: string;
}

export interface PaymentLinkListParams extends ListParams {
  productId?: string;
  active?: boolean;
}

// ---- Payments ----

export interface Payment {
  id: string;
  status: PaymentStatus;
  amount: string;
  assetCode: string;
  assetIssuer: string | null;
  memo: string | null;
  senderAddress: string | null;
  receiverAddress: string;
  transactionHash: string;
  product: { id: string; name: string };
  paymentLinkId: string | null;
  createdAt: string;
}

export interface PaymentListParams extends ListParams {
  status?: PaymentStatus;
  productId?: string;
  sortOrder?: "asc" | "desc";
}

// ---- Wallets ----

export interface Wallet {
  id: string;
  name: string;
  address: string;
  network: Network;
  status: WalletStatus;
  lastSyncAt: string | null;
  createdAt: string;
}

export interface WatchWalletInput {
  name: string;
  address: string;
  network: Network;
}

// ---- Webhooks ----

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: WebhookStatus;
  secretMasked: string;
  createdAt: string;
}

export interface WebhookWithSecret extends Webhook {
  secret: string;
}

export interface CreateWebhookInput {
  name: string;
  url: string;
  events: string[];
}
