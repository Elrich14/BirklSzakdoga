import { PRODUCT_GENDERS } from '@/constants/filterConstants';
import { create } from 'zustand';

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

const getStorageKey = (): string => {
  if (typeof window === "undefined") return "cart-guest";
  const userJson = localStorage.getItem("user");
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      return `cart-${user.email}`;
    } catch {
      return "cart-guest";
    }
  }
  return "cart-guest";
};

const loadCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(getStorageKey());
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
};

const saveCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(), JSON.stringify(items));
};

export const useCartStore = create<CartState>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.gender === item.gender &&
          cartItem.size === item.size &&
          cartItem.color === item.color
      );

      if (existing) {
        return {
          items: state.items.map((cartItem) =>
            cartItem.productId === item.productId &&
            cartItem.gender === item.gender &&
            cartItem.size === item.size &&
            cartItem.color === item.color
              ? {
                  ...cartItem,
                  productQuantity:
                    cartItem.productQuantity + item.productQuantity,
                }
              : cartItem
          ),
        };
      } else {
        return {
          items: [...state.items, item],
        };
      }
    }),

  updateItem: (originalGender, originalSize, originalColor, updatedItem) =>
    set((state) => ({
      items: state.items.map((cartItem) =>
        cartItem.gender === originalGender &&
        cartItem.size === originalSize &&
        cartItem.color === originalColor
          ? updatedItem
          : cartItem
      ),
    })),

  removeItem: (productId, gender, size, color) =>
    set((state) => ({
      items: state.items.filter(
        (cartItem) =>
          !(
            cartItem.productId === productId &&
            cartItem.gender === gender &&
            cartItem.size === size &&
            cartItem.color === color
          )
      ),
    })),

  updateQuantity: (productId, gender, size, color, quantity) =>
    set((state) => ({
      items: state.items.map((cartItem) =>
        cartItem.productId === productId &&
        cartItem.gender === gender &&
        cartItem.size === size &&
        cartItem.color === color
          ? { ...cartItem, productQuantity: quantity }
          : cartItem
      ),
    })),

  clearCart: () => set({ items: [] }),
}));

if (typeof window !== "undefined") {
  useCartStore.setState({ items: loadCart() });

  useCartStore.subscribe((state) => {
    saveCart(state.items);
  });

  window.addEventListener("userChanged", () => {
    useCartStore.setState({ items: loadCart() });
  });
}
