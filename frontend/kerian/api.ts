import { Product } from "../kerian/app/products/page";
import { PRODUCT_GENDERS } from "./constants/filterConstants";

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
  language?: string;
  cartItems: {
    productId: number;
    productName: string;
    productPrice: number;
    productQuantity: number;
    gender: typeof PRODUCT_GENDERS[keyof typeof PRODUCT_GENDERS];
    size: string;
    color: string;
  }[];
}

export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  description: string;
  imageUrl: string;
  gender: typeof PRODUCT_GENDERS[keyof typeof PRODUCT_GENDERS];
  price: number;
  quantity: number;
  color: string;
  size: string;
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
export async function fetchProductById(id: string | number): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product details");
  return res.json();
}

// GET WISHLIST
export async function getWishlist(): Promise<WishlistItem[]> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/api/wishlist`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Wishlist fetch failed");
  }

  return response.json();
}

// REMOVE ITEM FROM WISHLIST BY WISHLIST ITEM ID
export async function removeFromWishlistById(id: number): Promise<void> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}/api/wishlist/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to remove item from wishlist");
  }
}


// REMOVE ITEM FROM WISHLIST BY PRODUCT ID
export async function removeFromWishlistByProductId(
  productId: number
): Promise<void> {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/api/wishlist/product/${productId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to remove item from wishlist");
  }
}

// ADD TO WISHLIST
export async function addToWishlist(item: {
  productId: number;
  productName: string;
  description: string;
  imageUrl: string;
  price: number;
  color: string;
  size: string;
  gender: typeof PRODUCT_GENDERS[keyof typeof PRODUCT_GENDERS];
  quantity: number;
}): Promise<void> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}/api/wishlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to add to wishlist");
  }
}



// SEND ORDER
export async function sendOrder(data: OrderRequest): Promise<void> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api/orderEmail`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Order submission failed");
  }
}

// ADMIN API

export type StatsRange = "day" | "week" | "month" | "year";

export interface OrderStatsItem {
  label: string;
  orderCount: number;
  income: number;
}

export interface ProductStatsItem {
  label: string;
  quantity: number;
  revenue: number;
}

export interface DashboardStats {
  totalRevenue: number;
  ordersToday: number;
  totalProducts: number;
  totalCustomers: number;
}

export interface AdminProduct {
  id: number;
  name: string;
  description: string | null;
  imageUrls: string[] | null;
  price: number;
  category: string | null;
  color: string[];
  size: string[];
  gender: string[];
}

// FETCH ORDER STATS
export async function fetchOrderStats(
  range: StatsRange
): Promise<OrderStatsItem[]> {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE}/api/admin/orders/stats?range=${range}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to fetch order stats");
  }

  return response.json();
}

// FETCH PRODUCT STATS
export async function fetchProductStats(
  productId: number,
  range: StatsRange
): Promise<ProductStatsItem[]> {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE}/api/admin/products/${productId}/stats?range=${range}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to fetch product stats");
  }

  return response.json();
}

// FETCH ADMIN PRODUCTS
export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/api/admin/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to fetch products");
  }

  return response.json();
}

// CREATE PRODUCT
export async function createProduct(formData: FormData): Promise<AdminProduct> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/api/admin/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to create product");
  }

  return response.json();
}

// UPDATE PRODUCT
export async function updateProduct(
  id: number,
  formData: FormData
): Promise<AdminProduct> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/api/admin/products/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to update product");
  }

  return response.json();
}

// DELETE PRODUCT
export async function deleteProduct(id: number): Promise<void> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/api/admin/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to delete product");
  }
}

// FETCH DASHBOARD STATS
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to fetch dashboard stats");
  }

  return response.json();
}
