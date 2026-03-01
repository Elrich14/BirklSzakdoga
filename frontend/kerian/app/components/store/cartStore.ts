import { PRODUCT_GENDERS } from '@/constants/filterConstants';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  productId: number;
  productDescription: string;
  productName: string;
  productPrice: number;
  productQuantity: number;
  gender: typeof PRODUCT_GENDERS[keyof typeof PRODUCT_GENDERS];
  size: string;
  color: string;
  productImageUrl: string;
  availableSizes: string[];
  availableColors: string[];
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateItem: (
    originalGender: typeof PRODUCT_GENDERS[keyof typeof PRODUCT_GENDERS],
    originalSize: string,
    originalColor: string,
    updatedItem: CartItem
  ) => void;
   removeItem: (
    productId: number,
    gender: typeof PRODUCT_GENDERS[keyof typeof PRODUCT_GENDERS],
    size: string,
    color: string
  ) => void;
  updateQuantity: (
    productId: number,
    gender: typeof PRODUCT_GENDERS[keyof typeof PRODUCT_GENDERS],
    size: string,
    color: string,
    quantity: number
  ) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(persist((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) =>
          i.productId === item.productId &&
          i.gender === item.gender &&
          i.size === item.size &&
          i.color === item.color
      );

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === item.productId &&
            i.gender === item.gender &&
            i.size === item.size &&
            i.color === item.color
              ? {
                  ...i,
                  productQuantity: i.productQuantity + item.productQuantity,
                }
              : i
          ),
        };
      } else {
        return {
          items: [...state.items, item],
        };
      }
    }),

updateItem: (
  originalGender,
  originalSize,
  originalColor,
  updatedItem
) =>
  set((state) => ({
    items: state.items.map((i) =>
      i.gender === originalGender &&
      i.size === originalSize &&
      i.color === originalColor
        ? updatedItem
        : i
    ),
  })),


  removeItem: (productId, gender, size, color) =>
    set((state) => ({
      items: state.items.filter(
        (i) =>
          !(
            i.productId === productId &&
            i.gender === gender &&
            i.size === size &&
            i.color === color
          )
      ),
    })),

  updateQuantity: (productId, gender, size, color, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId &&
        i.gender === gender &&
        i.size === size &&
        i.color === color
          ? { ...i, productQuantity: quantity }
          : i
      ),
    })),

  clearCart: () => set({ items: [] }),
}), { name: "cart-storage" }));
