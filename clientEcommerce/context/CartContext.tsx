import { dummyCart } from "@/assets/assets";
import { Product } from "@/constants/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type CartItem = {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  size: string;
  price: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);

  // ✅ Fetch cart
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setIsLoading(true);

    const serverCart = dummyCart;

    const mappedItems: CartItem[] = serverCart.items.map((item: any) => ({
      id: `${item.product._id}-${item.size}`, // ✅ unique id
      productId: item.product._id,
      product: item.product,
      quantity: item.quantity,
      size: item.size || "M",
      price: item.price,
    }));

    setCartItems(mappedItems);
    setIsLoading(false);
  };

  // ✅ Auto calculate total
  useEffect(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCartTotal(total);
  }, [cartItems]);

  // ✅ Item count
  const itemCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // ✅ Add to cart
  const addToCart = (product: Product, size: string) => {
    const existing = cartItems.find(
      (item) => item.productId === product._id && item.size === size
    );

    if (existing) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: `${product._id}-${size}`, // ✅ unique
        productId: product._id,
        product,
        quantity: 1,
        size,
        price: product.price,
      };

      setCartItems((prev) => [...prev, newItem]);
    }
  };

  // ✅ Remove item
  const removeFromCart = (itemId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.id !== itemId)
    );
  };

  // ✅ Update quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // ✅ Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ✅ Hook
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}