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

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch("http://localhost:3000/auth/login", {
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


export async function registerUser(data: RegisterRequest): Promise<void> {
  const response = await fetch("http://localhost:3000/auth/register", {
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


export async function fetchAllProducts() {
    const res = await fetch("http://localhost:3000/api/products");
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  }
  
export async function fetchProductById(id: string | number): Promise<Product[]> {
  const res = await fetch(`http://localhost:3000/api/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product details");
  return res.json();
}

  