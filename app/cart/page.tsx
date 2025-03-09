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
  const [userId, setUserId] = useState<number | null>(1); // Contoh userId, bisa diambil dari auth context
  const [processingItems, setProcessingItems] = useState<number[]>([]);

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

  // Fetch data cart dan total
  const fetchCartData = useCallback(async () => {
    if (!guestId) return;

    setLoading(true);
    try {
      const [itemsRes, totalRes] = await Promise.all([
        fetch(`http://localhost:5000/cart/findMany?guestId=${guestId}`),
        fetch(
          `http://localhost:5000/cart/total?userId=${userId}&guestId=${guestId}`
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
      toast.error("Gagal mengambil data cart");
    } finally {
      setLoading(false);
    }
  }, [guestId, userId]);

  // Update quantity item
  const updateCartItem = async (id: number, newQuantity: number) => {
    const originalItems = [...cartItems];
    try {
      setProcessingItems((prev) => [...prev, id]);

      // Optimistic update
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );

      const response = await fetch(`http://localhost:5000/cart/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Barang habis");
      }

      // Fetch total saja setelah update
      const totalRes = await fetch(
        `http://localhost:5000/cart/total?userId=${userId}&guestId=${guestId}`
      );
      if (!totalRes.ok) {
        throw new Error("Gagal mengambil total");
      }
      const total = await totalRes.text();
      setTotal(total);
    } catch (error) {
      // Rollback jika terjadi error
      setCartItems(originalItems);
      toast.error("Barang belum restock");
    } finally {
      setProcessingItems((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  // Fungsi konfirmasi hapus menggunakan toast modal
  const confirmDeletion = (): Promise<boolean> => {
    return new Promise((resolve) => {
      toast.warn(
        <div>
          <p className="font-medium">Yakin ingin menghapus item ini?</p>
          <div className="flex justify-center gap-2 mt-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                resolve(false);
                toast.dismiss();
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="ghost"
              color="primary"
              onClick={() => {
                resolve(true);
                toast.dismiss();
              }}
            >
              Yes
            </Button>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        }
      );
    });
  };

  // Hapus item dari cart dengan konfirmasi modal menggunakan toast
  const deleteCartItem = async (id: number) => {
    const confirmed = await confirmDeletion();
    if (!confirmed) return;

    try {
      setProcessingItems((prev) => [...prev, id]);

      const response = await fetch(`http://localhost:5000/cart/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus item");
      }

      // Hapus item dari state tanpa fetch ulang semua data
      setCartItems((prev) => prev.filter((item) => item.id !== id));

      // Fetch total setelah hapus item
      const totalRes = await fetch(
        `http://localhost:5000/cart/total?userId=${userId}&guestId=${guestId}`
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

  // Inisialisasi session dan fetch data saat komponen dimuat
  useEffect(() => {
    initializeGuestSession();
  }, [initializeGuestSession]);

  useEffect(() => {
    if (guestId) fetchCartData();
  }, [guestId, fetchCartData]);

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
                    {/* Layout responsif: flex-col di mobile dan flex-row di md ke atas */}
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
                          onClick={() =>
                            updateCartItem(item.id, item.quantity - 1)
                          }
                        >
                          -
                        </Button>
                        <span className="px-2">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={processingItems.includes(item.id)}
                          onClick={() =>
                            updateCartItem(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </Button>
                      </div>
                      {/* Tombol Hapus */}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={processingItems.includes(item.id)}
                        onClick={() => deleteCartItem(item.id)}
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
    </div>
  );
};

export default CartPage;
