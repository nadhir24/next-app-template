"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Button, ButtonGroup } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Image } from "@heroui/image";
import { Divider } from "@heroui/divider";
import { Trash2 } from "lucide-react";
import { Modal, ModalContent, ModalBody, useDisclosure } from "@heroui/modal";

interface CartItem {
  id: number;
  userId: number | null;
  guestId: string | null;
  quantity: number;
  createdAt: string;
  user?: { id: number; email: string } | null;
  catalog?: { id: number; name: string; image: string } | null;
  size?: { id: number; size: string; price: string } | null;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<string>("Rp0");
  const [guestId, setGuestId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [processingItems, setProcessingItems] = useState<number[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Inisialisasi user dan session
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } else {
      initializeGuestSession();
    }
  }, []);

  // Fetch data cart dan total
  const fetchCartData = useCallback(async () => {
    setLoading(true);
    try {
      let url;
      if (user?.id) {
        url = `http://localhost:5000/cart/findMany?userId=${user.id}`;
      } else if (guestId) {
        url = `http://localhost:5000/cart/findMany?guestId=${guestId}`;
      } else {
        return;
      }

      const [itemsRes, totalRes] = await Promise.all([
        fetch(url),
        fetch(
          `http://localhost:5000/cart/total?${
            user?.id ? `userId=${user.id}` : `guestId=${guestId}`
          }`
        ),
      ]);

      if (!itemsRes.ok || !totalRes.ok) {
        throw new Error("Gagal mengambil data");
      }

      const [items, total] = await Promise.all([
        itemsRes.json(),
        totalRes.text(),
      ]);
      setCartItems(items);
      setTotal(total);
    } catch (error) {
      console.error("Error in fetchCartData:", error);
      toast.error("Gagal mengambil data cart");
    } finally {
      setLoading(false);
    }
  }, [user, guestId]);

  // Re-fetch when user or guestId changes
  useEffect(() => {
    fetchCartData();
  }, [user, guestId, fetchCartData]);

  // Update quantity item
  const updateCartItem = async (id: number, newQuantity: number) => {
    const originalItems = [...cartItems];
    const originalTotal = total;
    try {
      setProcessingItems((prev) => [...prev, id]);

      // Update state lokal dulu untuk UX yang lebih responsif
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );

      // Hitung total baru secara lokal
      const newTotal = calculateNewTotal(cartItems, id, newQuantity);
      setTotal(newTotal);

      // Kirim ke server
      const response = await fetch(`http://localhost:5000/cart/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: newQuantity,
          userId: user?.id,
          guestId: guestId,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal update quantity");
      }

      // Ambil total yang benar dari server (tanpa mengubah UI)
      const totalRes = await fetch(
        `http://localhost:5000/cart/total?${
          user?.id ? `userId=${user.id}` : `guestId=${guestId}`
        }`
      );

      if (totalRes.ok) {
        const serverTotal = await totalRes.text();
        setTotal(serverTotal);
      }
    } catch (error) {
      console.error("Error in updateCartItem:", error);
      setCartItems(originalItems);
      setTotal(originalTotal);
      toast.error("Gagal update quantity");
    } finally {
      setProcessingItems((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  // Helper function untuk menghitung total baru secara lokal
  const calculateNewTotal = (
    items: CartItem[],
    updatedId: number,
    newQuantity: number
  ): string => {
    const total = items.reduce((sum, item) => {
      const price = parseFloat(
        item.size?.price?.replace(/[^0-9.-]+/g, "") || "0"
      );
      const quantity = item.id === updatedId ? newQuantity : item.quantity;
      return sum + price * quantity;
    }, 0);

    return `Rp${total.toLocaleString("id-ID")}`;
  };

  // Hapus item dari cart tanpa fetch ulang
  const deleteCartItem = async (id: number) => {
    try {
      setProcessingItems((prev) => [...prev, id]);

      const response = await fetch(`http://localhost:5000/cart/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus item");
      }

      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));

      const totalRes = await fetch(
        `http://localhost:5000/cart/total?${
          user?.id ? `userId=${user.id}` : `guestId=${guestId}`
        }`
      );
      if (!totalRes.ok) {
        throw new Error("Gagal mengambil total");
      }
      const total = await totalRes.text();
      setTotal(total);
    } catch (error) {
      toast.error("Gagal menghapus item");
    } finally {
      setProcessingItems((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  // Fungsi untuk membuka modal dan mengatur item yang akan dihapus
  const confirmDeletion = (id: number) => {
    setItemToDelete(id); // Set ID item yang akan dihapus
    onOpen(); // Buka modal
  };

  // Fungsi untuk menghapus item setelah konfirmasi
  const handleDelete = async () => {
    if (itemToDelete) {
      await deleteCartItem(itemToDelete); // Panggil fungsi penghapusan
    }
    onClose(); // Tutup modal setelah selesai
  };

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
        console.error("Session error:", error);
      }
    } else {
      setGuestId(storedGuestId);
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <ToastContainer position="top-center" />
      <h2 className="text-2xl font-bold mb-4">Keranjang Belanja</h2>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-24 rounded" />
          ))}
        </div>
      ) : cartItems.length === 0 ? (
        <p>Keranjang Anda kosong.</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Daftar Item Cart */}
          <div className="w-full md:w-2/3">
            <div className="grid gap-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="shadow-sm">
                  <CardBody>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      {/* Gambar Produk */}
                      {item.catalog?.image && (
                        <Image
                          src={item.catalog.image}
                          alt={item.catalog.name}
                          width={190}
                          height={190}
                          className="object-cover rounded-lg"
                        />
                      )}
                      {/* Detail Produk */}
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-lg capitalize font-semibold">
                          {item.catalog?.name}
                        </h3>
                        <p className="text-medium text-gray-600">
                          Ukuran: {item.size?.size}
                        </p>
                        <p className="text-medium text-gray-600">
                          Harga: {item.size?.price}
                        </p>
                      </div>
                      {/* Tombol Quantity */}
                      <div className="flex flex-row gap-2 items-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={
                            processingItems.includes(item.id) ||
                            item.quantity <= 1
                          }
                          onPress={() => {
                            const newQuantity = item.quantity - 1;
                            updateCartItem(item.id, newQuantity);
                          }}
                        >
                          -
                        </Button>
                        <span className="px-2">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={processingItems.includes(item.id)}
                          onPress={() => {
                            const newQuantity = item.quantity + 1;
                            updateCartItem(item.id, newQuantity);
                          }}
                        >
                          +
                        </Button>
                      </div>
                      {/* Tombol Hapus */}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={processingItems.includes(item.id)}
                        onPress={() => confirmDeletion(item.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
          {/* Total dan Checkout */}
          <div className="w-full md:w-1/3">
            <Card className="sticky top-4">
              <CardHeader>
                <h3 className="text-xl font-bold">Ringkasan Belanja</h3>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Total:</span>
                    <span className="text-xl font-bold">{total}</span>
                  </div>
                  <Divider />
                  <div className="flex justify-end">
                    <Link href="/checkout">
                      <Button
                        color="primary"
                        size="md"
                        disabled={cartItems.length === 0}
                      >
                        Checkout Sekarang
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalBody>
            <div className="pt-1">
              <h3 className="text-lg font-bold mb-4">Konfirmasi</h3>
              <p className="mb-4 font-medium">
                Yakin ingin menghapus item ini?
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary" onPress={handleDelete}>
                  Hapus
                </Button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CartPage;
