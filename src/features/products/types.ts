import { type Network, type PriceType } from "@/generated/prisma/enums";

export interface ProductWalletRef {
  id: string;
  name: string;
  address: string;
  network: Network;
}

export interface ProductDTO {
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
