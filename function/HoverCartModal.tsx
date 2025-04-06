"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Link } from "@heroui/link";

interface Size {
  id: number;
  size: string;
  price: string;
}

interface CartItem {
  id: number;
  userId: number | null;
  guestId: string | null;
  quantity: number;
  createdAt: string;
  catalog?: { id: number; name: string; image: string } | null;
  size?: Size | null;
}

interface HoverCartModalProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  isLoggedIn: boolean;
  userId?: number;
}

const HoverCartModal: React.FC<HoverCartModalProps> = ({
  cartItems,
  setCartItems,
  isLoggedIn,
  userId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Inisialisasi guest session
  const initializeGuestSession = useCallback(async () => {
    const storedGuestId = localStorage.getItem("guestId");
    if (!storedGuestId) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/cart/guest-session`
        );
        const { guestId } = await response.json();
        localStorage.setItem("guestId", guestId);
        setGuestId(guestId);
      } catch (error) {
        toast.error("Gagal inisialisasi session");
      }
    } else {
      setGuestId(storedGuestId);
    }
  }, []);

  // Mengambil data cart dari backend
  const fetchCartData = useCallback(async () => {
    if (isLoading || isDebouncing) return;

    try {
      setIsLoading(true);
      setIsDebouncing(true);
      let url = "";
      if (isLoggedIn && userId) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/cart/findMany?userId=${userId}`;
      } else if (guestId) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/cart/findMany?guestId=${guestId}`;
      } else {
        return;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Gagal mengambil data");
      const items = await response.json();
      setCartItems(items);
      setCartCount(items.length); // Simpan jumlah item di state terpisah
      localStorage.setItem("cart", JSON.stringify(items));
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Gagal mengambil data cart");
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsDebouncing(false), 1000); 
    }
  }, [guestId, isLoggedIn, userId, setCartItems]);

  useEffect(() => {
    if (!isLoggedIn) {
      initializeGuestSession();
    }
  }, [isLoggedIn, initializeGuestSession]);

  useEffect(() => {
    fetchCartData();
  }, [fetchCartData]);
 
  return (
    <>
      <Button onPress={() => setIsModalOpen(true)}>
        {cartCount > 0 ? `Keranjang (${cartCount})` : "Keranjang"}
        {isLoading && " ..."}
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed right-0 top-0 h-full w-full md:w-1/2 lg:w-1/3 bg-white shadow-lg"
      >
        <ModalContent>
          <ModalHeader className="border-b p-4">
            <h2 className="text-xl font-bold">Keranjang Belanja</h2>
            <div className="flex justify-end mt-4 ml-9">
              <Link href="/cart">
                <Button
                  color="primary"
                  size="md"
                  disabled={cartItems.length === 0}
                  className="ml-auto"
                >
                  Selengkapnya
                </Button>
              </Link>
            </div>
          </ModalHeader>

          <ModalBody className="p-4 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b py-3"
                >
                  {item.catalog?.image && (
                    <Image
                      src={item.catalog.image}
                      alt={item.catalog.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}

                  <div className="flex flex-col flex-1 capitalize">
                    <h3 className="text-md font-semibold">
                      {item.catalog?.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      Ukuran: {item.size?.size}
                    </p>

                    <p className="text-sm font-medium text-gray-900">
                      Rp{" "}
                      {new Intl.NumberFormat("id-ID").format(
                        parseFloat(
                          item.size?.price?.replace(/[^0-9.-]+/g, "") || "0"
                        )
                      )}
                    </p>

                    <p className="text-sm text-gray-500">
                      Jumlah: {item.quantity}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Keranjang kosong</p>
            )}
          </ModalBody>
          <ModalFooter className="flex justify-between items-center p-4 border-t">
            <div className="text-lg font-semibold">
              Total: Rp{" "}
              {new Intl.NumberFormat("id-ID").format(
                cartItems.reduce((total, item) => {
                  return (
                    total +
                    parseFloat(
                      item.size?.price?.replace(/[^0-9.-]+/g, "") || "0"
                    ) *
                      item.quantity
                  );
                }, 0)
              )}
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default HoverCartModal;
