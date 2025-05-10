"use client";
import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Download, RefreshCcw } from "lucide-react";
import Tombol from "@/components/button";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

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
  midtransInvoiceUrl?: string;
  midtransInvoicePdfUrl?: string;
}

function CheckoutSuksesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorInvoice, setErrorInvoice] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const MAX_RETRIES = 3;

  const orderId = searchParams.get("order_id");

  // Deteksi status login user - pindahkan ke dalam useEffect untuk mencegah hydration error
  const checkLoginStatus = () => {
    // Hanya jalankan di browser
    if (typeof window === "undefined") return "CHECKING";

    const token = localStorage.getItem("token");
    const guestId = localStorage.getItem("guestId");

    if (token) {
      return "LOGGED_IN"; // User sudah login
    } else if (guestId) {
      return "GUEST"; // User adalah guest
    } else {
      return "UNKNOWN"; // Status tidak diketahui
    }
  };

  const [loginStatus, setLoginStatus] = useState("CHECKING");

  // Pastikan kode browser hanya dijalankan setelah hydration
  useEffect(() => {
    setIsBrowser(true);
    setLoginStatus(checkLoginStatus());
  }, []);

  const handleRetryInvoice = async () => {
    if (retryCount >= MAX_RETRIES) {
      toast.error("Sudah mencoba 3 kali. Mohon hubungi customer service.");
      return;
    }

    setLoading(true);
    setErrorInvoice(false);

    try {
      // Trigger invoice generation manually
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/snap/invoice/generate-manual`,
        {
          orderId: orderId,
          phoneNumber: phoneNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setOrderDetail(response.data.data);
        setErrorInvoice(false);
        toast.success("Invoice berhasil dibuat!");
      } else {
        setErrorInvoice(true);
        toast.error("Gagal membuat invoice. Silakan coba lagi.");
      }
    } catch (err) {
      setErrorInvoice(true);
      toast.error("Gagal membuat invoice. Silakan coba lagi.");
    } finally {
      setLoading(false);
      setRetryCount((prev) => prev + 1);
    }
  };

  const handleDownloadPdf = () => {
    if (!orderDetail?.midtransInvoicePdfUrl) return;

    setIsPdfLoading(true);

    // Buka PDF di tab baru
    window.open(orderDetail.midtransInvoicePdfUrl, "_blank");

    // Reset loading state setelah 3 detik (lebih lama untuk menangani koneksi lambat)
    setTimeout(() => {
      setIsPdfLoading(false);
    }, 3000);
  };

  useEffect(() => {
    if (!orderId) {
      return;
    }

    if (!user && orderId) {
      localStorage.setItem("guestInvoiceId", orderId);
    } else if (user) {
      localStorage.removeItem("guestInvoiceId");
    }

    const fetchOrderDetail = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/payment/snap/order-detail?orderId=${orderId}`
        );

        if (response.data.success) {
          const data = response.data.data;
          setOrderDetail(data);
          setLoading(false);

          if (data.status === "settlement" && !data.midtransInvoicePdfUrl) {
            setErrorInvoice(true);
            toast.error("Invoice belum tersedia. Silakan coba generate ulang.");
          }
        }
      } catch (err) {
        setLoading(false);
      }
    };

    fetchOrderDetail();

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/payment/snap/order-detail?orderId=${orderId}`
        );

        if (response.data.success) {
          const data = response.data.data;
          setOrderDetail(data);

          if (loading) {
            setLoading(false);
          }

          if (data.status === "settlement") {
            clearInterval(interval);
            if (!data.midtransInvoicePdfUrl) {
              setErrorInvoice(true);
              toast.error(
                "Invoice belum tersedia. Silakan coba generate ulang."
              );
            }
          }
        }
      } catch (err) {
        // Handle error silently
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, user, loading]);

  // Fallback jika loading terlalu lama
  useEffect(() => {
    // Matikan loading otomatis setelah 10 detik
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [loading]);

  // Tambahkan fungsi untuk mengarahkan ke halaman yang sesuai
  const navigateToOrderDetails = () => {
    // Aktifkan state loading untuk memberikan feedback visual
    setIsNavigating(true);

    if (loginStatus === "LOGGED_IN") {
      // Jika user sudah login, arahkan ke dashboard
      window.location.href = `/dashboard/invoice`;
    } else {
      // Jika user adalah guest, arahkan ke halaman invoice detail
      window.location.href = `/invoice`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            {loading ? (
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
              </div>
            ) : (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            {loading ? (
              <Skeleton className="h-8 w-48 mx-auto" />
            ) : (
              "Pembayaran Berhasil!"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full mx-auto mb-1" />
              <Skeleton className="h-4 w-5/6 mx-auto" />
            </div>
          ) : (
            <p className="text-gray-600">
              Terima kasih atas pesanan Anda. Kami telah menerima pembayaran
              Anda dan sedang memproses pesanan Anda.
            </p>
          )}

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Nomor Order</p>
            {loading ? (
              <Skeleton className="h-5 w-3/4 mx-auto" />
            ) : (
              <p className="font-medium">
                {orderDetail?.midtransOrderId || "Tidak tersedia"}
              </p>
            )}
          </div>
          {loading ? (
            <div className="mt-4">
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            orderDetail?.midtransInvoicePdfUrl && (
              <div className="mt-4">
                <Tombol
                  variant="solid"
                  className="w-full"
                  onPress={handleDownloadPdf}
                  isDisabled={isPdfLoading}
                >
                  {isPdfLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      Memuat PDF...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Invoice PDF
                    </>
                  )}
                </Tombol>
              </div>
            )
          )}

          {loading ? (
            <Skeleton className="h-4 w-4/5 mx-auto" />
          ) : (
            <p className="text-sm text-gray-500">
              {loginStatus === "LOGGED_IN"
                ? "Anda juga dapat melihat status pesanan di halaman Dashboard Anda."
                : "Anda juga dapat melihat status pesanan di halaman Invoice Anda."}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {errorInvoice && (
            <div className="space-y-2">
              <p className="text-sm text-red-600">
                Invoice belum tersedia. Silakan coba generate ulang.
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Masukkan nomor telepon (contoh: 081234567890)"
                  className="w-full p-2 border rounded-md"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <Tombol
                  variant="solid"
                  className="w-full"
                  onPress={handleRetryInvoice}
                  isDisabled={loading || retryCount >= MAX_RETRIES}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Generate Ulang Invoice
                    </>
                  )}
                </Tombol>
                {retryCount >= MAX_RETRIES && (
                  <p className="text-xs text-red-500">
                    Sudah mencoba {MAX_RETRIES} kali. Mohon hubungi customer
                    service.
                  </p>
                )}
              </div>
            </div>
          )}
          {isBrowser && orderDetail?.status === "SETTLEMENT" && (
            <Tombol
              className="w-full"
              variant="ghost"
              onPress={navigateToOrderDetails}
              isDisabled={isNavigating}
            >
              {isNavigating ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-t-transparent border-gray-600 rounded-full animate-spin"></div>
                  {loginStatus === "LOGGED_IN"
                    ? "Mengarahkan ke Dashboard..."
                    : "Mengarahkan ke Detail Pesanan..."}
                </>
              ) : loginStatus === "LOGGED_IN" ? (
                "Lihat di Dashboard"
              ) : (
                "Lihat Detail Pesanan"
              )}
            </Tombol>
          )}
          <Tombol
            variant="ghost"
            className="w-full"
            isDisabled={loading}
            onPress={() => {
              if (!loading && isBrowser) {
                window.location.href = "/katalog";
              }
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-t-transparent border-gray-600 rounded-full animate-spin"></div>
                Memuat...
              </>
            ) : (
              "Lanjutkan Belanja"
            )}
          </Tombol>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SuksesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading Page...</div>}>
      <CheckoutSuksesContent />
    </Suspense>
  );
}
