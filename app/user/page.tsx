"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardBody } from "@nextui-org/react";
import { Divider } from "@nextui-org/react";
import { Image } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CartItem } from "@/function/CartItem";

export default function UserPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<string>("Rp0");
  const [user, setUser] = useState<any>(null);
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      const storedGuestId = localStorage.getItem("guestId");
      if (storedGuestId) {
        setGuestId(storedGuestId);
      }
    }
  }, []);

  const fetchCartData = useCallback(async () => {
    setLoading(true);
    try {
      let url;
      if (user?.id) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/cart/findMany?userId=${user.id}`;
      } else if (guestId) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/cart/findMany?guestId=${guestId}`;
      } else {
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

      setCartItems(items);
      setTotal(total);
    } catch (error) {
      toast.error("Gagal mengambil data cart");
    } finally {
      setLoading(false);
    }
  }, [user, guestId]);

  useEffect(() => {
    fetchCartData();
  }, [fetchCartData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>
      {cartItems.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center py-8">Keranjang belanja kosong</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="w-full">
              <CardBody className="flex items-center gap-4">
                {item.catalog?.image && (
                  <Image
                    src={item.catalog.image}
                    alt={item.catalog.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{item.catalog?.name}</h3>
                  <p className="text-sm text-gray-600">
                    Ukuran: {item.size?.size}
                  </p>
                  <p className="text-sm text-gray-600">
                    Harga: {item.size?.price}
                  </p>
                  <p className="text-sm text-gray-600">
                    Jumlah: {item.quantity}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
          <Divider className="my-4" />
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="font-semibold">Subtotal:</p>
              <p className="text-lg">{total}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="font-semibold">Ongkir:</p>
              <p className="text-lg">Rp30.000</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="font-semibold">Total:</p>
              <p className="font-bold text-xl">{`Rp${(
                parseInt(total.replace(/[^0-9]/g, "")) + 30000
              ).toLocaleString("id-ID")}`}</p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              color="primary"
              onClick={() => (window.location.href = "/checkout")}
              disabled={cartItems.length === 0}
            >
              Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
