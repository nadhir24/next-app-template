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
<<<<<<< HEAD
import { toast, Toaster } from "sonner"; // Atau react-toastify
=======
import { toast } from "sonner"; // Atau react-toastify
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76

// Definisikan tipe CartItem seperti di HoverCartModal atau lebih lengkap
export interface CartItem {
  id: number;
  userId: number | null;
  guestId: string | null;
<<<<<<< HEAD
  quantity: number; // Ini adalah quantity di cart, BUKAN stok
  createdAt: string;
  catalog?: { id: number; name: string; image: string | null } | null;
  size?: {
    id: number;
    size: string;
    price: string;
    qty?: number; // Ini adalah stok asli dari produk size
  } | null;
  user?: { id: number; email: string } | null; // Pastikan user ada jika dibutuhkan
=======
  quantity: number;
  createdAt: string;
  catalog?: { id: number; name: string; image: string | null } | null;
  size?: { id: number; size: string; price: string } | null;
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76
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
<<<<<<< HEAD
    // Jika items kosong, paksa count = 0
    if (!items.length && count > 0) {
      count = 0;
      total = 0;
      console.warn(
        "Inconsistent cart data detected, resetting count and total"
      );
    }

=======
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76
    localStorage.setItem("cart_items", JSON.stringify(items));
    localStorage.setItem("cart_count", count.toString());
    localStorage.setItem("cart_total", total.toString());
  } catch (err) {
    console.warn("[CartContext] Failed to store cart data in localStorage");
  }
};

<<<<<<< HEAD
// Format price function to ensure consistency
const formatPrice = (price: string | number | undefined): string => {
  if (!price) return "Rp0";
  if (typeof price === "string") {
    // If already formatted with Rp, return as is
    if (price.includes("Rp")) return price;

    // Otherwise, try to parse it and format
    const numericValue = parseInt(price.replace(/\D/g, "") || "0");
    return `Rp${new Intl.NumberFormat("id-ID").format(numericValue)}`;
  }
  return `Rp${new Intl.NumberFormat("id-ID").format(price)}`;
};

=======
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76
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

<<<<<<< HEAD
  // Separate effect to listen for create_guest_session events
  useEffect(() => {
    const handleCreateGuestSession = (event: CustomEvent) => {
      console.log(
        "[CartContext] Received create_guest_session event:",
        event.detail
      );

      // Check if we already have a guest ID
      if (localStorage.getItem("guestId")) {
        console.log("[CartContext] Guest ID already exists, skipping creation");
        return;
      }

      // Create a new guest session
      const createGuestSession = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/cart/guest-session`
          );
          if (response.data.guestId) {
            console.log(
              "[CartContext] Created new guest ID after logout:",
              response.data.guestId
            );
            localStorage.setItem("guestId", response.data.guestId);
            setGuestId(response.data.guestId);
            // Notify other components that guest ID has changed
            window.dispatchEvent(new Event("guestIdChange"));
          }
        } catch (err) {
          console.error(
            "[CartContext] Error creating guest session after logout:",
            err
          );
        }
      };

      createGuestSession();
    };

    window.addEventListener(
      "create_guest_session",
      handleCreateGuestSession as EventListener
    );

    return () => {
      window.removeEventListener(
        "create_guest_session",
        handleCreateGuestSession as EventListener
      );
    };
  }, []);

=======
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76
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
<<<<<<< HEAD
      console.log(
        "[CartContext] Raw items data from API:",
        JSON.stringify(itemsData)
      ); // Log data mentah

      const countData = countRes.data.count || 0;
      const totalDataNumber = parseTotal(totalRes.data);

      // Format all prices consistently when loading data
      const formattedItems = itemsData.map((item: any) => {
        // Log setiap item sebelum format
        console.log(
          `[CartContext] Processing item from API: ID=${item.id}, Size Data=`,
          item.size
        );
        return {
          ...item,
          size: item.size
            ? {
                ...item.size,
                price: formatPrice(item.size.price),
                // Pastikan qty tetap ada jika memang ada dari API
                qty:
                  item.size.qty !== undefined
                    ? Number(item.size.qty)
                    : undefined,
              }
            : null,
        };
      });
      console.log(
        "[CartContext] Formatted items before storing:",
        JSON.stringify(formattedItems)
      );

      // Update localStorage cache
      storeCartData(formattedItems, countData, totalDataNumber);

      // Update state
      setCartItems(formattedItems);
=======
      const countData = countRes.data.count || 0;
      const totalDataNumber = parseTotal(totalRes.data);

      // Update localStorage cache
      storeCartData(itemsData, countData, totalDataNumber);

      // Update state
      setCartItems(itemsData);
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76
      setCartCount(countData);
      setCartTotal(totalDataNumber);
    } catch (error) {
      // Try to restore from localStorage
      try {
        const storedItems = localStorage.getItem("cart_items");
        const storedCount = localStorage.getItem("cart_count");
        const storedTotal = localStorage.getItem("cart_total");

        if (storedItems && storedCount && storedTotal) {
<<<<<<< HEAD
          const storedItemsData = JSON.parse(storedItems);
          const formattedStoredItems = storedItemsData.map((item: any) => ({
            ...item,
            size: item.size
              ? {
                  ...item.size,
                  price: formatPrice(item.size.price),
                }
              : null,
          }));
          setCartItems(formattedStoredItems);
=======
          setCartItems(JSON.parse(storedItems));
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76
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

<<<<<<< HEAD
  // Fungsi utilitas untuk menampilkan error (lebih sederhana)
  const showErrorMessage = (message: string) => {
    // Cek jika pesan berisi "Insufficient stock", format menjadi lebih user-friendly
    if (message.includes("Insufficient stock")) {
      const errorParts =
        /Insufficient stock for (.*?) \((.*?)\). Available: (\d+)/.exec(
          message
        );
      if (errorParts) {
        const [_, productName, size, available] = errorParts;
        const friendlyMessage = `Stok ${productName} (${size}) tidak cukup. Tersedia: ${available}`;

        console.log("[CartContext] Showing friendly toast:", friendlyMessage);
        toast.error(friendlyMessage, {
          duration: 4000,
          position: "top-center",
          style: { fontWeight: "500" },
        });
        return; // Keluar dari fungsi setelah menampilkan pesan yang diformat
      }
    }

    // Untuk pesan error lainnya
    console.log("[CartContext] Showing toast:", message);
    toast.error(message, {
      duration: 4000,
      position: "top-center",
      style: { fontWeight: "500" },
    });
  };

=======
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76
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
<<<<<<< HEAD
          // Tangkap secara eksplisit pesan insufficient stock
          const errorMessage = response.data.message || "Gagal memperbarui.";
          console.log("[CartContext] Error from API:", errorMessage);

          // Tampilkan hanya satu toast
          showErrorMessage(errorMessage);

          return Promise.reject(new Error(errorMessage));
        }
      } catch (error: any) {
        // Extract error message
        let errorMessage = "Gagal memperbarui keranjang.";

        // Check if error has response data with message
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        // Check if error already has a message property
        else if (error.message) {
          errorMessage = error.message;
        }

        console.log("[CartContext] Error updating cart:", errorMessage);

        // Tampilkan toast error
        showErrorMessage(errorMessage);

        return Promise.reject(new Error(errorMessage));
      }
    },
    [user?.id, guestId, fetchCartImpl]
  );
=======
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
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76

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

<<<<<<< HEAD
  // Di CartProvider setelah useEffect pertama
  useEffect(() => {
    // Force reset localStorage on initial load (temporary fix)
    localStorage.setItem("cart_items", "[]");
    localStorage.setItem("cart_count", "0");
    localStorage.setItem("cart_total", "0");

    // Existing code...
  }, []); // Empty dependency array = run once on mount

=======
>>>>>>> 77f85158d758c5ddc80273101a0ba52b5035df76
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
