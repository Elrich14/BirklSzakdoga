import { Product } from "../kerian/app/products/page";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface OrderRequest {
  name: string;
  email: string;
  shippingAddress: string;
  billingAddress?: string;
  note?: string;
  cartItems: {
    productId: number;
    productName: string;
    productPrice: number;
    productQuantity: number;
    gender: "Male" | "Female";
    size: string;
    color: string;
  }[];
}


const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// LOGIN
export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Login failed");
  }

  return await response.json();
}

// REGISTER
export async function registerUser(data: RegisterRequest): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Registration failed");
  }
}

// GET ALL PRODUCTS
export async function fetchAllProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/api/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

// GET PRODUCT BY ID
export async function fetchProductById(id: string | number): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/api/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product details");
  return res.json();
}

// SEND ORDER
export async function sendOrder(data: OrderRequest): Promise<void> {
  const response = await fetch(`${API_BASE}/api/orderEmail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Order submission failed");
  }
}
