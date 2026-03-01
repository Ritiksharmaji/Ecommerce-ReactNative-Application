import { dummyWishlist } from "@/assets/assets";
import { Product, WishlistContextType } from "@/constants/types";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    setLoading(true);
    setWishlist(dummyWishlist);
    setLoading(false);
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // toggle wishlist
    const toggleWishlist = async (product: Product) => {
        setWishlist((prev) => {
        const exists = prev.some((p) => p._id === product._id);
        if (exists) {
            //  REMOVE item
            return prev.filter((p) => p._id !== product._id);
        }
        // ADD item
        return [...prev, product];
        });
    };

  // check if exists
    const isInWishlist = (productId: string) => {
        return wishlist.some((p) => p._id === productId);
    };

    return (
        <WishlistContext.Provider
            value={{ wishlist, loading, isInWishlist, toggleWishlist }}
        >
        {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error("useWishlist must be used within WishlistProvider");
    }
    return context;
}