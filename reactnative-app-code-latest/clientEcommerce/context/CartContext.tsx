import { Product } from "@/constants/types";
import api from "@/constants/api";
import { normalizeProducts } from "@/constants/normalize";
import { useAuth } from "@/context/AuthContext";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Web backend cart shape: { [productId]: { [size]: quantity } }
type CartData = Record<string, Record<string, number>>;

export type CartItem = {
  id: string; // productId (matches the web cartData key)
  productId: string;
  product: Product;
  quantity: number;
  size: string;
  price: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, quantity: number, size: string) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, isLoaded } = useAuth();

  const [cartData, setCartData] = useState<CartData>({});
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);

  // Load product catalogue once (needed to resolve cart line details)
  const loadProducts = async (): Promise<Record<string, Product>> => {
    try {
      const { data } = await api.get("/api/product/list");
      if (data?.success) {
        const map: Record<string, Product> = {};
        normalizeProducts(data.products).forEach((p) => (map[p._id] = p));
        setProductMap(map);
        return map;
      }
    } catch (e) {
      // ignore - cart will resolve once products are available
    }
    return {};
  };

  // Fetch the server cart (logged-in) or keep the local guest cart
  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const map = await loadProducts();
      if (token) {
        const { data } = await api.post("/api/cart/get", {});
        if (data?.success && data.cartData) {
          setCartData(data.cartData);
          buildItems(data.cartData, map);
        }
      } else {
        buildItems(cartData, map);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, token]);

  // Turn the cartData map into a flat list the UI can render
  const buildItems = (data: CartData, map: Record<string, Product>) => {
    const items: CartItem[] = [];
    Object.entries(data).forEach(([productId, sizes]) => {
      const product = map[productId];
      if (!product) return;
      Object.entries(sizes).forEach(([size, qty]) => {
        if (qty > 0) {
          items.push({
            id: productId,
            productId,
            product,
            quantity: qty,
            size,
            price: product.price,
          });
        }
      });
    });
    setCartItems(items);
  };

  // Rebuild + recompute totals whenever the map or catalogue changes
  useEffect(() => {
    buildItems(cartData, productMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartData, productMap]);

  useEffect(() => {
    setCartTotal(cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0));
  }, [cartItems]);

  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  // ---- mutations (optimistic local update + server sync when logged in) ----

  const addToCart = (product: Product, size: string) => {
    setProductMap((prev) => ({ ...prev, [product._id]: product }));
    setCartData((prev) => {
      const next: CartData = { ...prev };
      next[product._id] = { ...(next[product._id] || {}) };
      next[product._id][size] = (next[product._id][size] || 0) + 1;
      return next;
    });

    if (token) {
      api.post("/api/cart/add", { itemId: product._id, size }).catch(() => {});
    }
  };

  const updateQuantity = (productId: string, quantity: number, size: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCartData((prev) => {
      const next: CartData = { ...prev };
      next[productId] = { ...(next[productId] || {}) };
      next[productId][size] = quantity;
      return next;
    });

    if (token) {
      api.post("/api/cart/update", { itemId: productId, size, quantity }).catch(() => {});
    }
  };

  const removeFromCart = (productId: string, size: string) => {
    setCartData((prev) => {
      const next: CartData = { ...prev };
      if (next[productId]) {
        next[productId] = { ...next[productId] };
        delete next[productId][size];
        if (Object.keys(next[productId]).length === 0) delete next[productId];
      }
      return next;
    });

    // web has no delete endpoint; setting quantity 0 removes it server-side
    if (token) {
      api.post("/api/cart/update", { itemId: productId, size, quantity: 0 }).catch(() => {});
    }
  };

  const clearCart = () => {
    if (token) {
      Object.entries(cartData).forEach(([productId, sizes]) => {
        Object.keys(sizes).forEach((size) => {
          api.post("/api/cart/update", { itemId: productId, size, quantity: 0 }).catch(() => {});
        });
      });
    }
    setCartData({});
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

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
