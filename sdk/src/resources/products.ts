import type { HttpClient } from "../http";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductListParams,
  Paginated,
} from "../types";

/** Manage products. */
export class ProductsResource {
  constructor(private readonly http: HttpClient) {}

  /** Create a product. */
  async create(input: CreateProductInput): Promise<Product> {
    return (await this.http.request<Product>("POST", "/products", { body: input })).data;
  }

  /** List products (paginated, filterable, sortable). */
  async list(params?: ProductListParams): Promise<Paginated<Product>> {
    const r = await this.http.request<Product[]>("GET", "/products", { query: params });
    return { data: r.data, meta: r.meta! };
  }

  /** Get a single product by id. */
  async get(id: string): Promise<Product> {
    return (await this.http.request<Product>("GET", `/products/${id}`)).data;
  }

  /** Update a product. */
  async update(id: string, input: UpdateProductInput): Promise<Product> {
    return (await this.http.request<Product>("PATCH", `/products/${id}`, { body: input })).data;
  }

  /** Delete a product (only when it has no payment history). */
  async delete(id: string): Promise<void> {
    await this.http.request("DELETE", `/products/${id}`);
  }
}
