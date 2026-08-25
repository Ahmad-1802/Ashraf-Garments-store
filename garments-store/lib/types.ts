export type Variant = {
  size: string;
  stock: number;
};

export type Section = "Boys" | "Girls" | "Uniforms";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  section: Section;
  subCategory: string;
  image: string;
  variants: Variant[];
  createdAt: string;
};

export type CartItem = {
  productId: string;
  name: string;
  size: string;
  price: number;
  qty: number;
  image: string;
};

export type Customer = {
  name: string;
  phone: string;
  address: string;
  city: string;
};

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "cod";
export type PaymentMethod = "cod" | "payfast";

export type Order = {
  id: string;
  items: CartItem[];
  customer: Customer;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  courierTrackingId?: string;
  courierProvider?: string;
  createdAt: string;
};
