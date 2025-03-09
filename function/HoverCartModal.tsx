"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
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

  // Inisialisasi guest session
  const initializeGuestSession = useCallback(async () => {
    const storedGuestId = localStorage.getItem("guestId");
    if (!storedGuestId) {
      try {
        const response = await fetch(
          "http://localhost:5000/cart/guest-session"
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

  // Mengambil data cart berdasarkan guestId
  const fetchCartData = useCallback(async () => {
    if (!guestId) return;
    try {
      const response = await fetch(
        `http://localhost:5000/cart/findMany?guestId=${guestId}`
      );
      if (!response.ok) throw new Error("Gagal mengambil data");
      const items = await response.json();
      setCartItems(items);
    } catch (error) {
      toast.error("Gagal mengambil data cart");
    }
  }, [guestId]);

  useEffect(() => {
    initializeGuestSession();
  }, [initializeGuestSession]);

  useEffect(() => {
    if (guestId) fetchCartData();
  }, [guestId, fetchCartData]);

  return (
    <>
      <Button onPress={() => setIsModalOpen(true)}>
        Keranjang ({cartItems.length})
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed right-0 top-0 h-full w-full md:w-1/2 lg:w-1/3 bg-white shadow-lg"
      >
        <ModalContent>
          <ModalHeader className="border-b p-4">
            <h2 className="text-xl font-bold">Keranjang Belanja</h2>
            <div className="flex justify-end">
              <Link href="/cart">
                <Button
                  color="primary"
                  size="md"
                  disabled={cartItems.length === 0}
                >
                  selengkapnyaa
                </Button>
              </Link>
            </div>
          </ModalHeader>

          <ModalBody className="p-4 overflow-y-auto max-h-[70vh]">
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
                      {item.size?.price}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Keranjang kosong</p>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default HoverCartModal;
