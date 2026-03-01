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
export async function fetchProductById(id: string | number): Promise<Product[]> {
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

// REMOVE ITEM FROM WISHLIST
export async function removeFromWishlist(productId: number): Promise<void> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}/api/wishlist/${productId}`, {
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
