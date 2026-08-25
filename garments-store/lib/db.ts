import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import { Product, Order, CartItem, Customer, PaymentMethod } from "./types";

// The app uses Supabase/Postgres in production and keeps the JSON store as a
// local-development fallback. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
// on Vercel to automatically use the production database.

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const useSupabase = Boolean(supabaseUrl && supabaseKey);

async function readJson<T>(file: string): Promise<T[]> {
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as T[];
}

async function writeJson<T>(file: string, data: T[]): Promise<void> {
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

function requireSupabase() {
  if (!supabaseUrl || !supabaseKey) throw new Error("Supabase is not configured");
  return { url: supabaseUrl.replace(/\/$/, ""), key: supabaseKey };
}

async function supabaseRequest<T>(
  tableOrRpc: string,
  options: { method?: string; body?: unknown; query?: string; rpc?: boolean } = {}
): Promise<T> {
  const { url, key } = requireSupabase();
  const endpoint = options.rpc
    ? `${url}/rest/v1/rpc/${tableOrRpc}`
    : `${url}/rest/v1/${tableOrRpc}${options.query ?? ""}`;
  const response = await fetch(endpoint, {
    method: options.method ?? "GET",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${message}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function fromProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price),
    section: row.section ?? "Boys",
    subCategory: row.sub_category ?? "",
    image: row.image ?? "",
    variants: row.variants ?? [],
    createdAt: row.created_at
  };
}

function fromOrder(row: any): Order {
  return {
    id: row.id,
    items: row.items ?? [],
    customer: row.customer ?? { name: "", phone: "", address: "", city: "" },
    total: Number(row.total),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    courierTrackingId: row.courier_tracking_id ?? undefined,
    courierProvider: row.courier_provider ?? undefined,
    createdAt: row.created_at
  };
}

// ---------- Products ----------

export async function getProducts(): Promise<Product[]> {
  if (useSupabase) {
    const rows = await supabaseRequest<any[]>(
      "products",
      { query: "?select=*&order=created_at.desc" }
    );
    return rows.map(fromProduct);
  }
  return readJson<Product>(PRODUCTS_FILE);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  if (useSupabase) {
    const rows = await supabaseRequest<any[]>(
      "products",
      { query: `?select=*&id=eq.${encodeURIComponent(id)}&limit=1` }
    );
    return rows[0] ? fromProduct(rows[0]) : undefined;
  }
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

export async function createProduct(
  data: Omit<Product, "id" | "createdAt">
): Promise<Product> {
  if (useSupabase) {
    const rows = await supabaseRequest<any[]>("products", {
      method: "POST",
      body: {
        id: uuid(),
        name: data.name,
        description: data.description,
        price: data.price,
        section: data.section,
        sub_category: data.subCategory,
        image: data.image,
        variants: data.variants
      }
    });
    return fromProduct(rows[0]);
  }

  const products = await getProducts();
  const product: Product = { ...data, id: uuid(), createdAt: new Date().toISOString() };
  products.push(product);
  await writeJson(PRODUCTS_FILE, products);
  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id" | "createdAt">>
): Promise<Product | undefined> {
  if (useSupabase) {
    const body: Record<string, unknown> = {};
    if (data.name !== undefined) body.name = data.name;
    if (data.description !== undefined) body.description = data.description;
    if (data.price !== undefined) body.price = data.price;
    if (data.section !== undefined) body.section = data.section;
    if (data.subCategory !== undefined) body.sub_category = data.subCategory;
    if (data.image !== undefined) body.image = data.image;
    if (data.variants !== undefined) body.variants = data.variants;
    const rows = await supabaseRequest<any[]>("products", {
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(id)}`,
      body
    });
    return rows[0] ? fromProduct(rows[0]) : undefined;
  }

  const products = await getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  products[index] = { ...products[index], ...data };
  await writeJson(PRODUCTS_FILE, products);
  return products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (useSupabase) {
    const rows = await supabaseRequest<any[]>("products", {
      method: "DELETE",
      query: `?id=eq.${encodeURIComponent(id)}`
    });
    return rows.length > 0;
  }
  const products = await getProducts();
  const next = products.filter((p) => p.id !== id);
  if (next.length === products.length) return false;
  await writeJson(PRODUCTS_FILE, next);
  return true;
}

// Local-only helper retained for development fallback.
export async function decrementStock(productId: string, size: string, qty: number): Promise<void> {
  const products = await getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) throw new Error("Product not found");
  const variant = product.variants.find((v) => v.size === size);
  if (!variant) throw new Error("Selected size is not available");
  if (variant.stock < qty) throw new Error("Insufficient stock");
  variant.stock -= qty;
  await writeJson(PRODUCTS_FILE, products);
}

// ---------- Orders ----------

export async function getOrders(): Promise<Order[]> {
  if (useSupabase) {
    const rows = await supabaseRequest<any[]>(
      "orders",
      { query: "?select=*&order=created_at.desc" }
    );
    return rows.map(fromOrder);
  }
  const orders = await readJson<Order>(ORDERS_FILE);
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrder(id: string): Promise<Order | undefined> {
  if (useSupabase) {
    const rows = await supabaseRequest<any[]>(
      "orders",
      { query: `?select=*&id=eq.${encodeURIComponent(id)}&limit=1` }
    );
    return rows[0] ? fromOrder(rows[0]) : undefined;
  }
  const orders = await getOrders();
  return orders.find((o) => o.id === id);
}

export async function createOrderSecure(input: {
  items: Pick<CartItem, "productId" | "size" | "qty">[];
  customer: Customer;
  paymentMethod: PaymentMethod;
}): Promise<Order> {
  if (useSupabase) {
    const rows = await supabaseRequest<any[]>("create_order_secure", {
      method: "POST",
      rpc: true,
      body: {
        p_items: input.items,
        p_customer: input.customer,
        p_payment_method: input.paymentMethod
      }
    });
    return fromOrder(rows[0]);
  }

  // Local development fallback: recalculate prices from the local catalog.
  const products = await getProducts();
  const serverItems: CartItem[] = [];
  let total = 0;

  for (const item of input.items) {
    if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > 50) {
      throw new Error("Invalid quantity");
    }
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error("Product not found");
    const variant = product.variants.find((v) => v.size === item.size);
    if (!variant) throw new Error(`Size ${item.size} is not available for ${product.name}`);
    if (variant.stock < item.qty) throw new Error(`Not enough stock for ${product.name}`);

    serverItems.push({
      productId: product.id,
      name: product.name,
      size: item.size,
      price: product.price,
      qty: item.qty,
      image: product.image
    });
    total += product.price * item.qty;
  }

  const order: Order = {
    id: uuid(),
    items: serverItems,
    customer: input.customer,
    total,
    paymentMethod: input.paymentMethod,
    paymentStatus: "cod",
    orderStatus: "pending",
    createdAt: new Date().toISOString()
  };
  const orders = await readJson<Order>(ORDERS_FILE);
  orders.push(order);
  await writeJson(ORDERS_FILE, orders);
  for (const item of input.items) await decrementStock(item.productId, item.size, item.qty);
  return order;
}

export async function updateOrder(
  id: string,
  data: Partial<Omit<Order, "id" | "createdAt">>
): Promise<Order | undefined> {
  if (useSupabase) {
    const body: Record<string, unknown> = {};
    if (data.items !== undefined) body.items = data.items;
    if (data.customer !== undefined) body.customer = data.customer;
    if (data.total !== undefined) body.total = data.total;
    if (data.paymentMethod !== undefined) body.payment_method = data.paymentMethod;
    if (data.paymentStatus !== undefined) body.payment_status = data.paymentStatus;
    if (data.orderStatus !== undefined) body.order_status = data.orderStatus;
    if (data.courierTrackingId !== undefined) body.courier_tracking_id = data.courierTrackingId;
    if (data.courierProvider !== undefined) body.courier_provider = data.courierProvider;
    const rows = await supabaseRequest<any[]>("orders", {
      method: "PATCH",
      query: `?id=eq.${encodeURIComponent(id)}`,
      body
    });
    return rows[0] ? fromOrder(rows[0]) : undefined;
  }

  const orders = await readJson<Order>(ORDERS_FILE);
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return undefined;
  orders[index] = { ...orders[index], ...data };
  await writeJson(ORDERS_FILE, orders);
  return orders[index];
}
