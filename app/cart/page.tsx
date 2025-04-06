"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import { ToastContainer, toast } from "react-toastify";
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
  size?: { id: number; size: string; price: string; qty?: number } | null;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<string>("Rp0");
  const [guestId, setGuestId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [processingItems, setProcessingItems] = useState<number[]>([]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      initializeGuestSession();
    }
  }, []);

  const fetchCartData = useCallback(async () => {
    setLoading(true);
    try {
      let url;
      if (user?.id) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/cart/findMany?userId=${user.id}`;
        console.log("Fetching cart with userId:", user.id);
      } else if (guestId) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/cart/findMany?guestId=${guestId}`;
        console.log("Fetching cart with guestId:", guestId);
      } else {
        console.log("No user or guest ID available for cart fetch");
        return;
      }

      const [itemsRes, totalRes] = await Promise.all([
        fetch(url),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/cart/total?${
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
      console.log("Cart items fetched:", items);
      console.log("Cart total fetched:", total);
      setCartItems(items);
      setTotal(total);
    } catch (error) {
      console.error("Error in fetchCartData:", error);
      toast.error("Gagal mengambil data cart");
    } finally {
      setLoading(false);
    }
  }, [user, guestId]);

  useEffect(() => {
    fetchCartData();
  }, [user, guestId, fetchCartData]);

  const updateCartItem = async (id: number, newQuantity: number) => {
    console.log(`Updating cart item ${id} to quantity ${newQuantity}`);
    // Simpan state awal untuk rollback jika terjadi error
    const originalItems = [...cartItems];
    const originalTotal = total;
    console.log("Original items:", originalItems);

    try {
      // Tandai item sedang diproses
      setProcessingItems((prev) => [...prev, id]);
      const itemToUpdate = cartItems.find((item) => item.id === id);

      // Validasi client-side
      if (
        itemToUpdate &&
        itemToUpdate.size?.qty !== undefined &&
        newQuantity > itemToUpdate.size.qty
      ) {
        toast.error(`Stok tidak mencukupi. Tersedia: ${itemToUpdate.size.qty}`);
        return;
      }

      // PENTING: Tunda update UI sampai konfirmasi dari server
      // Jangan lakukan update optimistic

      // Kirim request ke server
      console.log("Sending update request with payload:", {
        quantity: newQuantity,
        userId: user?.id,
        guestId: guestId,
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantity: newQuantity,
            userId: user?.id,
            guestId: guestId,
          }),
        }
      );

      // Tangani response dengan benar
      let result;
      try {
        // Parse response JSON hanya sekali
        result = await response.json();
        console.log("Update response:", result);
      } catch (e) {
        console.error("Failed to parse response:", e);
        throw new Error("Invalid response from server");
      }

      // Cek apakah request berhasil
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal update quantity");
      }

      // Hanya update UI setelah konfirmasi server
      if (result.data) {
        console.log("Updating UI with result data:", result.data);
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id ? { ...item, ...result.data } : item
          )
        );
      } else {
        console.log("No result data, refreshing cart data");
        // Jika tidak ada data yang dikembalikan, refresh cart data
        await fetchCartData();
      }

      // Update total
      const totalRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/total?${
          user?.id ? `userId=${user.id}` : `guestId=${guestId}`
        }`
      );
      if (totalRes.ok) {
        const serverTotal = await totalRes.text();
        setTotal(serverTotal);
      }
    } catch (error) {
      console.error("Error in updateCartItem:", error);

      // Kembalikan ke state awal jika terjadi error
      setCartItems(originalItems);
      setTotal(originalTotal);

      // Tampilkan error
      toast.error(
        error instanceof Error ? error.message : "Gagal update quantity"
      );
    } finally {
      setProcessingItems((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const deleteCartItem = async (id: number) => {
    console.log(`Deleting cart item ${id}`);
    try {
      setProcessingItems((prev) => [...prev, id]);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Gagal menghapus item");
      }

      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));

      const totalRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/total?${
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

  const confirmDeletion = (id: number) => {
    setItemToDelete(id);
    onOpen();
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      await deleteCartItem(itemToDelete);
    }
    onClose();
  };

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
        console.error("Session error:", error);
      }
    } else {
      setGuestId(storedGuestId);
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      {/* Toast Container untuk notifikasi */}
      <ToastContainer position="top-center" />

      {/* Judul Halaman */}
      <h2 className="text-2xl font-bold mb-4">Keranjang Belanja</h2>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-600 animate-pulse">
            Memuat keranjang...
          </p>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Keranjang Anda kosong.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Bagian Kiri: Daftar Item */}
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
                        {item.size?.qty !== undefined && (
                          <p className="text-sm text-gray-500">
                            Tersedia: {item.size.qty}
                          </p>
                        )}
                      </div>

                      {/* Tombol Pengaturan Jumlah */}
                      <div className="flex flex-row gap-2 items-center">
                        {/* Tombol Kurangi (-) */}
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

                        {/* Jumlah Saat Ini */}
                        <span className="px-2">{item.quantity}</span>

                        {/* Tombol Tambah (+) */}
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={
                            processingItems.includes(item.id) ||
                            (item.size?.qty !== undefined &&
                              item.quantity >= item.size.qty)
                          }
                          onPress={() => {
                            // Validasi tambahan untuk mencegah spam klik
                            if (processingItems.includes(item.id)) {
                              return; // Jangan proses jika sedang memproses item ini
                            }

                            // Validasi client-side
                            if (
                              item.size?.qty !== undefined &&
                              item.quantity >= item.size.qty
                            ) {
                              toast.error(
                                `Stok tidak mencukupi. Tersedia: ${item.size.qty}`
                              );
                              return;
                            }

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

          {/* Bagian Kanan: Ringkasan Belanja */}
          <div className="w-full md:w-1/3">
            <Card className="sticky top-4">
              <CardHeader>
                <h3 className="text-xl font-bold">Ringkasan Belanja</h3>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col gap-4">
                  {/* Total Harga */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Total:</span>
                    <span className="text-xl font-bold">{total}</span>
                  </div>

                  {/* Divider */}
                  <Divider />

                  {/* Tombol Checkout */}
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

      {/* Modal Konfirmasi Hapus */}
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
