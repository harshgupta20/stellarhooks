import type { HttpClient } from "../http";
import type { Payment, PaymentListParams, Paginated } from "../types";

/** Read payment records. */
export class PaymentsResource {
  constructor(private readonly http: HttpClient) {}

  /** List payments (paginated, filter by status/product). */
  async list(params?: PaymentListParams): Promise<Paginated<Payment>> {
    const r = await this.http.request<Payment[]>("GET", "/payments", { query: params });
    return { data: r.data, meta: r.meta! };
  }

  /** Get a payment by id. */
  async get(id: string): Promise<Payment> {
    return (await this.http.request<Payment>("GET", `/payments/${id}`)).data;
  }
}
