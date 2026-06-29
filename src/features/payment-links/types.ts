export interface PaymentLinkProductRef {
  id: string;
  name: string;
  assetCode: string;
  priceType: "FIXED" | "CUSTOM";
  price: string | null;
}

export interface PaymentLinkDTO {
  id: string;
  slug: string;
  memo: string;
  url: string;
  active: boolean;
  paymentCount: number;
  product: PaymentLinkProductRef;
  createdAt: string;
}

/** Public-facing payment page data (no owner info). */
export interface PublicPaymentLinkDTO {
  slug: string;
  memo: string;
  walletAddress: string;
  network: "TESTNET" | "PUBLIC";
  product: {
    name: string;
    description: string | null;
    imageUrl: string | null;
    assetCode: string;
    assetIssuer: string | null;
    priceType: "FIXED" | "CUSTOM";
    price: string | null;
    minAmount: string | null;
  };
}
