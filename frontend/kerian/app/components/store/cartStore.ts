import { create } from 'zustand';

export type CartItem = {
  productId: number;
  productName: string;
  productPrice: number;
  productQuantity: number;
  gender: "Male" | "Female";
  size: string;
  color: string;
  productImageUrl: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, gender: "Male" | "Female", size: string, color: string) => void;
  updateQuantity: (
    productId: number,
    gender: "Male" | "Female",
    size: string,
    color: string,
    quantity: number
  ) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set) => ({
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
}));
