"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext"; // Import useAuth
import { toast } from "sonner"; // Atau react-toastify

// Definisikan tipe CartItem seperti di HoverCartModal atau lebih lengkap
export interface CartItem {
  id: number;
  userId: number | null;
  guestId: string | null;
  quantity: number;
  createdAt: string;
  catalog?: { id: number; name: string; image: string | null } | null;
  size?: { id: number; size: string; price: string } | null;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  isLoadingCart: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (
    catalogId: number,
    sizeId: number,
    quantity: number
  ) => Promise<void>;
  updateCartItem: (cartId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartId: number) => Promise<void>;
  clearCart: () => void; // Fungsi untuk membersihkan cart
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Separate utility functions outside component to prevent re-creation on render
const parseTotal = (totalString: any): number => {
  if (typeof totalString === "string" && totalString.startsWith("Rp")) {
    return parseInt(totalString.replace(/[^0-9]/g, ""), 10) || 0;
  } else if (typeof totalString === "number") {
    return totalString;
  }
  return 0;
};

const storeCartData = (items: CartItem[], count: number, total: number) => {
  try {
    localStorage.setItem("cart_items", JSON.stringify(items));
    localStorage.setItem("cart_count", count.toString());
    localStorage.setItem("cart_total", total.toString());
  } catch (err) {
    console.warn("[CartContext] Failed to store cart data in localStorage");
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [isLoadingCart, setIsLoadingCart] = useState<boolean>(true);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Get current identifier as a memoized value
  const currentIdentifier = useMemo(() => {
    return user?.id
      ? `userId=${user.id}`
      : guestId
        ? `guestId=${guestId}`
        : null;
  }, [user?.id, guestId]);

  // Initialize guest session when needed
  useEffect(() => {
    const storedGuestId = localStorage.getItem("guestId");

    // Handle user login case
    if (isLoggedIn) {
      if (storedGuestId) {
        localStorage.removeItem("guestId");
      }
      setGuestId(null);
    }
    // Handle guest user case
    else if (storedGuestId) {
      setGuestId(storedGuestId);
    }
    // Create new guest session
    else {
      const createGuestSession = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/cart/guest-session`
          );
          if (response.data.guestId) {
            localStorage.setItem("guestId", response.data.guestId);
            setGuestId(response.data.guestId);
            // Dispatch custom event untuk memberi tahu komponen lain bahwa guestId telah berubah
            window.dispatchEvent(new Event("guestIdChange"));
          }
        } catch (err) {
          console.error("[CartContext] Error creating guest session:", err);
        }
      };

      createGuestSession();
    }

    setHasInitialized(true);
  }, [isLoggedIn]); // Only depends on login state

  // Fetch cart implementation
  const fetchCartImpl = useCallback(async () => {
    if (!currentIdentifier) {
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
      setIsLoadingCart(false);
      return;
    }

    // Throttle API calls
    const lastFetchTime = localStorage.getItem("cart_last_fetch_time");
    const now = new Date().getTime();
    if (lastFetchTime && now - parseInt(lastFetchTime) < 1000) {
      return;
    }

    setIsLoadingCart(true);
    localStorage.setItem("cart_last_fetch_time", now.toString());

    try {
      // Add timestamp to prevent caching
      const [itemsRes, countRes, totalRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/cart/findMany?${currentIdentifier}&_t=${now}`
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/cart/count?${currentIdentifier}&_t=${now}`
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/cart/total?${currentIdentifier}&_t=${now}`
        ),
      ]);

      const itemsData = Array.isArray(itemsRes.data) ? itemsRes.data : [];
      const countData = countRes.data.count || 0;
      const totalDataNumber = parseTotal(totalRes.data);

      // Update localStorage cache
      storeCartData(itemsData, countData, totalDataNumber);

      // Update state
      setCartItems(itemsData);
      setCartCount(countData);
      setCartTotal(totalDataNumber);
    } catch (error) {
      // Try to restore from localStorage
      try {
        const storedItems = localStorage.getItem("cart_items");
        const storedCount = localStorage.getItem("cart_count");
        const storedTotal = localStorage.getItem("cart_total");

        if (storedItems && storedCount && storedTotal) {
          setCartItems(JSON.parse(storedItems));
          setCartCount(parseInt(storedCount, 10));
          setCartTotal(parseInt(storedTotal, 10));
        } else {
          setCartItems([]);
          setCartCount(0);
          setCartTotal(0);
        }
      } catch (storageError) {
        setCartItems([]);
        setCartCount(0);
        setCartTotal(0);
      }
    } finally {
      setIsLoadingCart(false);
    }
  }, [currentIdentifier]);

  // Public fetch cart function (stable reference)
  const fetchCart = useCallback(() => {
    return fetchCartImpl();
  }, [fetchCartImpl]);

  // Fetch cart when dependencies change
  useEffect(() => {
    if (hasInitialized && currentIdentifier) {
      fetchCartImpl();
    } else if (hasInitialized) {
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
      setIsLoadingCart(false);
    }
  }, [hasInitialized, currentIdentifier, fetchCartImpl]);

  // Add to cart function
  const addToCart = useCallback(
    async (catalogId: number, sizeId: number, quantity: number) => {
      const identifier = user?.id
        ? { userId: user.id }
        : guestId
          ? { guestId }
          : null;
      if (!identifier) {
        toast.error("Sesi tidak valid. Silakan refresh.");
        // Return a rejected promise for consistency
        return Promise.reject(new Error("No identifier"));
      }

      const payload = { ...identifier, catalogId, sizeId, quantity };
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/cart/add`,
          payload
        );
        if (response.data.success) {
          toast.success("Item ditambahkan!");
          // Call fetchCartImpl to refresh context state immediately
          await fetchCartImpl();
          return Promise.resolve();
        } else {
          toast.error(response.data.message || "Gagal menambahkan.");
          return Promise.reject(
            new Error(response.data.message || "Failed to add")
          );
        }
      } catch (error) {
        toast.error("Gagal menambahkan item ke keranjang.");
        return Promise.reject(error);
      }
    },
    [user?.id, guestId, fetchCartImpl]
  ); // Added fetchCartImpl to dependencies

  // Update cart item function
  const updateCartItem = useCallback(
    async (cartId: number, quantity: number) => {
      const payload: { quantity: number; userId?: number } = { quantity };
      if (user?.id) {
        payload.userId = user.id;
      }

      // Construct URL with guestId query parameter if applicable
      const identifierParams =
        !user?.id && guestId ? `?guestId=${guestId}` : "";
      const url = `${process.env.NEXT_PUBLIC_API_URL}/cart/${cartId}${identifierParams}`;

      try {
        // Use the constructed URL
        const response = await axios.put(url, payload);
        if (response.data.success) {
          await fetchCartImpl(); // Refresh context state
          return Promise.resolve();
        } else {
          toast.error(response.data.message || "Gagal memperbarui.");
          return Promise.reject(
            new Error(response.data.message || "Failed to update")
          );
        }
      } catch (error) {
        toast.error("Gagal memperbarui keranjang.");
        return Promise.reject(error);
      }
    },
    [user?.id, guestId, fetchCartImpl]
  ); // Added guestId dependency

  // Remove from cart function
  const removeFromCart = useCallback(
    async (cartId: number) => {
      const identifierParams = user?.id
        ? `userId=${user.id}`
        : guestId
          ? `guestId=${guestId}`
          : null;
      if (!identifierParams) {
        toast.error("Sesi tidak valid. Silakan refresh.");
        return Promise.reject(new Error("No identifier"));
      }

      try {
        // Pass identifier as query params for DELETE request
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/cart/${cartId}?${identifierParams}`
        );
        if (response.data.success) {
          // toast.success("Item dihapus."); // Already handled optimistically
          await fetchCartImpl(); // Refresh context state
          return Promise.resolve();
        } else {
          toast.error(response.data.message || "Gagal menghapus.");
          return Promise.reject(
            new Error(response.data.message || "Failed to remove")
          );
        }
      } catch (error) {
        toast.error("Gagal menghapus item dari keranjang.");
        return Promise.reject(error);
      }
    },
    [user?.id, guestId, fetchCartImpl]
  ); // Added dependencies

  // Function to clear cart state locally
  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartCount(0);
    setCartTotal(0);
    storeCartData([], 0, 0); // Clear local storage as well
    console.log("[CartContext] Cart state cleared locally.");
  }, []);

  // Listen for custom event to force cart reset (e.g., on logout)
  useEffect(() => {
    const handleForceReset = (event: CustomEvent) => {
      console.log(
        "[CartContext] Received FORCE_CART_RESET event:",
        event.detail
      );
      clearCart();
    };

    window.addEventListener("FORCE_CART_RESET" as any, handleForceReset);
    return () => {
      window.removeEventListener("FORCE_CART_RESET" as any, handleForceReset);
    };
  }, [clearCart]);

  // Context value memoized
  const contextValue = useMemo(
    () => ({
      cartItems,
      cartCount,
      cartTotal,
      isLoadingCart,
      fetchCart,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
    }),
    [
      cartItems,
      cartCount,
      cartTotal,
      isLoadingCart,
      fetchCart,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

// Custom hook to use the Cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
