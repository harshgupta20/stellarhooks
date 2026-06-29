import type { HttpClient } from "../http";
import type { Wallet, WatchWalletInput } from "../types";

/** Manage monitored wallets. */
export class WalletsResource {
  constructor(private readonly http: HttpClient) {}

  /** Start monitoring a Stellar address for incoming payments. */
  async watch(input: WatchWalletInput): Promise<Wallet> {
    return (await this.http.request<Wallet>("POST", "/wallets", { body: input })).data;
  }

  /** List monitored wallets. */
  async list(): Promise<Wallet[]> {
    return (await this.http.request<Wallet[]>("GET", "/wallets")).data;
  }

  /** Get a wallet by id. */
  async get(id: string): Promise<Wallet> {
    return (await this.http.request<Wallet>("GET", `/wallets/${id}`)).data;
  }

  /** Stop monitoring and delete a wallet. */
  async delete(id: string): Promise<void> {
    await this.http.request("DELETE", `/wallets/${id}`);
  }
}
