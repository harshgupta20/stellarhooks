import type { HttpClient } from "../http";
import type { PaymentLink, PaymentLinkListParams, Paginated } from "../types";

/** Manage payment links (hosted payment pages) for products. */
export class PaymentLinksResource {
  constructor(private readonly http: HttpClient) {}

  /** Create a payment link for a product. */
  async create(input: { productId: string }): Promise<PaymentLink> {
    return (await this.http.request<PaymentLink>("POST", "/payment-links", { body: input })).data;
  }

  /** List payment links (paginated). */
  async list(params?: PaymentLinkListParams): Promise<Paginated<PaymentLink>> {
    const r = await this.http.request<PaymentLink[]>("GET", "/payment-links", { query: params });
    return { data: r.data, meta: r.meta! };
  }

  /** Get a payment link by id. */
  async get(id: string): Promise<PaymentLink> {
    return (await this.http.request<PaymentLink>("GET", `/payment-links/${id}`)).data;
  }

  /** Enable or disable a payment link. */
  async update(id: string, input: { active: boolean }): Promise<PaymentLink> {
    return (await this.http.request<PaymentLink>("PATCH", `/payment-links/${id}`, { body: input }))
      .data;
  }

  /** Delete a payment link. */
  async delete(id: string): Promise<void> {
    await this.http.request("DELETE", `/payment-links/${id}`);
  }
}
