import type { HttpClient } from "../http";
import type { Webhook, WebhookWithSecret, CreateWebhookInput } from "../types";

/** Manage webhook endpoints. */
export class WebhooksResource {
  constructor(private readonly http: HttpClient) {}

  /** Create a webhook. The signing secret is returned once. */
  async create(input: CreateWebhookInput): Promise<WebhookWithSecret> {
    return (await this.http.request<WebhookWithSecret>("POST", "/webhooks", { body: input })).data;
  }

  /** List webhooks. */
  async list(): Promise<Webhook[]> {
    return (await this.http.request<Webhook[]>("GET", "/webhooks")).data;
  }

  /** Get a webhook by id. */
  async get(id: string): Promise<Webhook> {
    return (await this.http.request<Webhook>("GET", `/webhooks/${id}`)).data;
  }

  /** Delete a webhook. */
  async delete(id: string): Promise<void> {
    await this.http.request("DELETE", `/webhooks/${id}`);
  }
}
