"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Tombol from "@/components/button";
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

// Interface untuk tipe data invoice
interface InvoiceItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  currency: string;
}

interface OrderDetail {
  id: number;
  midtransOrderId: string;
  status: string;
  amount: number;
  currency: string;
  paymentUrl?: string;
  items: InvoiceItem[];
  user?: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}

export default function SuksesPage() {
  const searchParams = useSearchParams();
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/payment/snap/order-detail?orderId=${orderId}`);
        console.log("Respon dari backend:", response.data);

        if (response.data.success) {
          setOrderDetail(response.data.data);
          setLoading(false); // ✅ Set loading ke false setelah data didapat

          if (response.data.data.status === 'settlement') {
            clearInterval(interval); // Stop polling kalau sudah sukses
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000); // Cek setiap 3 detik

    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Pembayaran Berhasil!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Terima kasih atas pesanan Anda. Kami telah menerima pembayaran Anda dan sedang memproses pesanan Anda.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Nomor Pesanan</p>
            <p className="font-medium">
              {loading ? 'Memuat...' : (orderDetail?.midtransOrderId ? `#${orderDetail.midtransOrderId}` : 'Tidak tersedia')}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Email konfirmasi telah dikirim ke alamat email yang terdaftar. Anda juga dapat melihat status pesanan di halaman akun Anda.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Tombol className="w-full" variant="ghost">
            <Link href="/dashboard" className="w-full">
              Lihat Pesanan Saya
            </Link>
          </Tombol>
          <Tombol variant="ghost" className="w-full">
            <Link href="/katalog" className="w-full">
              Lanjutkan Belanja
            </Link>
          </Tombol>
        </CardFooter>
      </Card>
    </div>
  );
}
