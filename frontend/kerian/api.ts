import { Product } from "../kerian/app/products/page";
import { PRODUCT_GENDERS } from "./constants/filterConstants";
import { API_BASE, OrderStatus, StatsRange } from "./constants/constants";

export type { OrderStatus, StatsRange };

// ==================== AUTH TYPES ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginResponse =
  | { token: string; twoFactorRequired?: false }
  | { pendingToken: string; twoFactorRequired: true };

export interface TwoFactorSetupResponse {
  qrCodeDataUrl: string;
  manualEntryKey: string;
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
  remainingRecoveryCodes: number;
}

export interface TwoFactorVerifyResponse {
  token: string;
}

export interface TwoFactorRecoveryCodesResponse {
  recoveryCodes: string[];
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// ==================== PRODUCT TYPES ====================

export interface StockVariant {
  gender: string;
  size: string;
  color: string;
  stock: number;
}

// ==================== WISHLIST TYPES ====================

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

// ==================== ORDER TYPES ====================

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

export interface SendOrderResponse {
  orderId: number;
  status: OrderStatus;
}

export interface OrderStatusResponse {
  orderId: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderItem {
  id: number;
  orderId: number;
  productId: number | null;
  productName: string;
  productPrice: number;
  quantity: number;
  gender: string | null;
  size: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrder {
  id: number;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  billingAddress: string | null;
  note: string | null;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
}

export interface AdminOrdersPage {
  orders: AdminOrder[];
  nextCursor: number | null;
  hasMore: boolean;
}

// ==================== ADMIN TYPES ====================

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
  variants?: StockVariant[];
}

// ==================== REVIEW TYPES ====================

export interface Review {
  id: number;
  userId: string;
  productId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
  };
}

export type CanReviewReason =
  | "not-purchased"
  | "not-delivered"
  | "already-reviewed"
  | null;

export interface CanReviewResponse {
  canReview: boolean;
  reason: CanReviewReason;
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  comment?: string;
}

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

// ==================== 2FA ====================

export const verifyTwoFactor = async (
  pendingToken: string,
  code: string
): Promise<TwoFactorVerifyResponse> => {
  const response = await fetch(`${API_BASE}/auth/2fa/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pendingToken, code }),
  });

  if (!response.ok) {
    const err = await response.json();
    const error = new Error(err.error || "Verification failed") as Error & {
      status?: number;
      retryAfterSeconds?: number;
    };
    error.status = response.status;
    if (err.retryAfterSeconds !== undefined) {
      error.retryAfterSeconds = err.retryAfterSeconds;
    }
    throw error;
  }

  return response.json();
};

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchTwoFactorStatus =
  async (): Promise<TwoFactorStatusResponse> => {
    const response = await fetch(`${API_BASE}/auth/2fa/status`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch 2FA status");
    return response.json();
  };

export const setupTwoFactor = async (): Promise<TwoFactorSetupResponse> => {
  const response = await fetch(`${API_BASE}/auth/2fa/setup`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to start 2FA setup");
  return response.json();
};

export const enableTwoFactor = async (
  code: string
): Promise<TwoFactorRecoveryCodesResponse> => {
  const response = await fetch(`${API_BASE}/auth/2fa/enable`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ code }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to enable 2FA");
  }
  return response.json();
};

export const disableTwoFactor = async (
  password: string,
  code: string
): Promise<void> => {
  const response = await fetch(`${API_BASE}/auth/2fa/disable`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ password, code }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to disable 2FA");
  }
};

export const regenerateRecoveryCodes = async (
  code: string
): Promise<TwoFactorRecoveryCodesResponse> => {
  const response = await fetch(`${API_BASE}/auth/2fa/recovery-codes/regenerate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ code }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to regenerate recovery codes");
  }
  return response.json();
};

// GET ALL PRODUCTS
export async function fetchAllProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/api/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

// GET AI RECOMMENDATIONS BASED ON CART
export async function fetchRecommendations(
  cartProductIds: number[],
  language: string
): Promise<{ recommendedProductIds: number[] }> {
  const res = await fetch(`${API_BASE}/api/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartProductIds, language }),
  });
  if (!res.ok) throw new Error("Failed to fetch recommendations");
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
export async function sendOrder(
  data: OrderRequest
): Promise<SendOrderResponse> {
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
    if (err.error === "insufficientStock") {
      throw new Error(
        JSON.stringify({
          type: "insufficientStock",
          productName: err.productName,
          size: err.size,
          color: err.color,
          gender: err.gender,
          available: err.available,
          requested: err.requested,
        })
      );
    }
    throw new Error(err.message || "Order submission failed");
  }

  return response.json();
}

// FETCH ORDER STATUS (for tracking stepper)
export const fetchOrderStatus = async (
  orderId: number
): Promise<OrderStatusResponse> => {
  const response = await fetch(`${API_BASE}/api/orders/${orderId}/status`);

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to fetch order status");
  }

  return response.json();
};

// FETCH MY ORDERS (authenticated user)
export const fetchMyOrders = async (): Promise<AdminOrder[]> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/api/orders/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to fetch orders");
  }

  return response.json();
};

// STOCK
export async function fetchProductStock(
  productId: number | string
): Promise<StockVariant[]> {
  const res = await fetch(`${API_BASE}/api/products/${productId}/stock`);
  if (!res.ok) throw new Error("Failed to fetch stock");
  return res.json();
}

// ADMIN API

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

// UPDATE STOCK
export async function updateProductStock(
  productId: number,
  variants: StockVariant[]
): Promise<StockVariant[]> {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE}/api/admin/products/${productId}/stock`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ variants }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to update stock");
  }

  return response.json();
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

// ADMIN ORDERS

// FETCH ORDERS PAGE (ADMIN) — cursor-based pagination
export const fetchAdminOrders = async (
  cursor?: number | null
): Promise<AdminOrdersPage> => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  if (cursor) {
    params.set("cursor", String(cursor));
  }
  const queryString = params.toString();
  const url = `${API_BASE}/api/admin/orders${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to fetch orders");
  }

  return response.json();
};

// UPDATE ORDER STATUS (ADMIN)
export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatus
): Promise<AdminOrder> => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE}/api/admin/orders/${orderId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to update order status");
  }

  return response.json();
};

// REVIEWS

// GET REVIEWS FOR A PRODUCT
export async function fetchProductReviews(
  productId: number
): Promise<Review[]> {
  const response = await fetch(
    `${API_BASE}/api/reviews?productId=${productId}`
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to fetch reviews");
  }
  return response.json();
}

// CHECK IF CURRENT USER CAN REVIEW A PRODUCT
export async function canReviewProduct(
  productId: number
): Promise<CanReviewResponse> {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE}/api/reviews/can-review/${productId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to check eligibility");
  }
  return response.json();
}

// CREATE REVIEW
export async function createReview(
  data: CreateReviewRequest
): Promise<Review> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/api/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to create review");
  }
  return response.json();
}

// DELETE REVIEW
export async function deleteReview(reviewId: number): Promise<void> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to delete review");
  }
}
