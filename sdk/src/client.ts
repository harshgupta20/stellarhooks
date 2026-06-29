import { HttpClient, type HttpClientOptions } from "./http";
import { ProductsResource } from "./resources/products";
import { PaymentLinksResource } from "./resources/payment-links";
import { PaymentsResource } from "./resources/payments";
import { WalletsResource } from "./resources/wallets";
import { WebhooksResource } from "./resources/webhooks";

/**
 * StellarPlatform API client.
 *
 * ```ts
 * const client = new StellarPlatform(API_KEY, { baseUrl: "https://your-app.com" });
 * const product = await client.products.create({ ... });
 * ```
 */
export class StellarPlatform {
  readonly products: ProductsResource;
  readonly paymentLinks: PaymentLinksResource;
  readonly payments: PaymentsResource;
  readonly wallets: WalletsResource;
  readonly webhooks: WebhooksResource;

  constructor(apiKey: string, options?: HttpClientOptions) {
    const http = new HttpClient(apiKey, options);
    this.products = new ProductsResource(http);
    this.paymentLinks = new PaymentLinksResource(http);
    this.payments = new PaymentsResource(http);
    this.wallets = new WalletsResource(http);
    this.webhooks = new WebhooksResource(http);
  }
}
