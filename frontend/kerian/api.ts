import { Product } from "../kerian/app/products/page";
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

  