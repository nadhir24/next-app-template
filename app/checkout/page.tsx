"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { TruckIcon, CreditCard, ShieldCheck, Package } from "lucide-react";
import Tombol from "@/components/button";

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

interface CheckoutData {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export default function CheckoutPage() {
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    district: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
  });
  const [saveInfo, setSaveInfo] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailOffers, setEmailOffers] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    items: [],
    subtotal: 0,
    shipping: 0,
    total: 0,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState<string>("gojek");

  const shippingMethods: ShippingMethod[] = [
    {
      id: "gojek",
      name: "Gojek",
      description: "Same day (max 30km)",
      price: 25000,
      estimatedDays: "Same day",
    },
  ];

  // Fungsi untuk mengambil data user jika sudah login
  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`
      );
      if (!response.ok) throw new Error("Failed to fetch user data");

      const userData = await response.json();
      setShippingAddress({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        address: userData.address || "",
        district: userData.district || "",
        city: userData.city || "",
        province: userData.province || "",
        postalCode: userData.postalCode || "",
        phone: userData.phone || "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fungsi untuk mengambil data checkout
  const fetchCheckoutData = useCallback(
    async (userIdParam?: string) => {
      try {
        const isLoggedIn = !!userIdParam || !!userId;
        const guestIdFromStorage = localStorage.getItem("guestId");

        let url = "";
        if (isLoggedIn) {
          url = `${process.env.NEXT_PUBLIC_API_URL}/cart/findMany?userId=${
            userIdParam || userId
          }`;
        } else if (guestIdFromStorage) {
          url = `${process.env.NEXT_PUBLIC_API_URL}/cart/findMany?guestId=${guestIdFromStorage}`;
        } else {
          return;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Gagal mengambil data");
        const items = await response.json();

        // Transformasi data untuk format CheckoutData
        const transformedItems = items.map((item: any) => ({
          id: item.id.toString(),
          name: item.catalog?.name || "",
          price: parseFloat(item.size?.price?.replace(/[^0-9.-]+/g, "") || "0"),
          quantity: item.quantity,
          size: item.size?.size || "",
          image: item.catalog?.image || "",
        }));

        const subtotal = transformedItems.reduce((total: number, item: any) => {
          return total + item.price * item.quantity;
        }, 0);

        setCheckoutData({
          items: transformedItems,
          subtotal: subtotal,
          shipping: 0,
          total: subtotal,
        });

        // Update localStorage dengan data terbaru
        localStorage.setItem("cart", JSON.stringify(items));
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Gagal mengambil data cart");
      }
    },
    [userId, setCheckoutData]
  );

  // Effect untuk mengecek user login dan mengambil data
  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId");
    if (userIdFromStorage) {
      setUserId(userIdFromStorage);
      fetchUserData(userIdFromStorage);
    }
    fetchCheckoutData(userIdFromStorage || undefined);
  }, [fetchCheckoutData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createTransaction = async () => {
    setLoading(true);
    try {
      // Get the selected shipping method
      const selectedMethod = shippingMethods.find(
        (method) => method.id === selectedShippingMethod
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/snap/create-transaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            shippingAddress,
            items: checkoutData.items,
            shipping: selectedMethod?.price || 0,
            total: checkoutData.subtotal + (selectedMethod?.price || 0),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to create transaction");

      const data = await response.json();
      if (data.success && data.data.paymentLink) {
        window.location.href = data.data.paymentLink;
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Gagal membuat transaksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">Selesaikan pembelian Anda dengan aman</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Bagian */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" /> Informasi Kontak
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="email"
                  name="email"
                  value={shippingAddress.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full"
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailOffers"
                    checked={emailOffers}
                    onChange={(e) => setEmailOffers(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label
                    htmlFor="emailOffers"
                    className="ml-2 text-sm text-gray-600"
                  >
                    Kirimkan saya berita dan penawaran melalui email
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TruckIcon className="h-5 w-5" /> Informasi Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    name="firstName"
                    value={shippingAddress.firstName}
                    onChange={handleInputChange}
                    placeholder="Nama Depan"
                  />
                  <Input
                    type="text"
                    name="lastName"
                    value={shippingAddress.lastName}
                    onChange={handleInputChange}
                    placeholder="Nama Belakang"
                  />
                </div>
                <Input
                  type="text"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  placeholder="Alamat"
                />
                <Input
                  type="text"
                  name="district"
                  value={shippingAddress.district}
                  onChange={handleInputChange}
                  placeholder="Kecamatan"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    placeholder="Kota"
                  />
                  <Input
                    type="text"
                    name="province"
                    value={shippingAddress.province}
                    onChange={handleInputChange}
                    placeholder="Provinsi"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    placeholder="Kode Pos"
                  />
                  <Input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    placeholder="Nomor Telepon"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="saveInfo"
                    checked={saveInfo}
                    onChange={(e) => setSaveInfo(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label
                    htmlFor="saveInfo"
                    className="ml-2 text-sm text-gray-600"
                  >
                    Simpan informasi ini untuk pembelian berikutnya
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" /> Metode Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shippingMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 flex justify-between items-center cursor-pointer transition-colors ${selectedShippingMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setSelectedShippingMethod(method.id)}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id={method.id}
                        name="shippingMethod"
                        value={method.id}
                        checked={selectedShippingMethod === method.id}
                        onChange={(e) =>
                          setSelectedShippingMethod(e.target.value)
                        }
                        className="h-4 w-4 text-blue-600 mr-3"
                      />
                      <label htmlFor={method.id} className="cursor-pointer">
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-gray-500">
                          {method.description}
                        </div>
                      </label>
                    </div>
                    <div className="text-right font-medium">
                      Rp {method.price.toLocaleString()}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" /> Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-4 bg-white">
                    <div className="flex items-center">
                      <span className="font-medium">Payments By Midtrans</span>
                    </div>
                    <div className="flex space-x-2 opacity-70">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">VISA</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">MASTERCARD</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">JCB</span>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-600 mt-4">
                    <p>Setelah mengklik "Bayar Sekarang", Anda akan diarahkan ke</p>
                    <p>Payments By Midtrans untuk menyelesaikan pembelian Anda dengan aman.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4">
                    {checkoutData.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center pb-4 border-b border-gray-100"
                      >
                        <div className="relative w-16 h-16 bg-gray-100 rounded-md mr-4 overflow-hidden">
                          <Image
                            src={item.image || "/blurry.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute -top-2 -right-2 bg-gray-700 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
                          <p className="text-xs text-gray-500">Ukuran: {item.size}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Rp {item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Discount Code */}
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Kode Diskon"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-1"
                    />
                    <Tombol variant="shadow" size="sm" className="whitespace-nowrap">
                      Terapkan
                    </Tombol>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>Rp {checkoutData.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pengiriman</span>
                      {selectedShippingMethod ? (
                        <span>
                          Rp{" "}
                          {shippingMethods
                            .find((m) => m.id === selectedShippingMethod)
                            ?.price.toLocaleString() || 0}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Pilih metode pengiriman
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100 text-base font-medium">
                      <span>Total</span>
                      <span>
                        Rp{" "}
                        {(
                          checkoutData.subtotal +
                          (shippingMethods.find(
                            (m) => m.id === selectedShippingMethod
                          )?.price || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Tombol
                    onPress={createTransaction}
                    className="w-full bg-black hover:bg-gray-800 text-white"
                    size="lg"
                  >
                    {loading ? "Memproses..." : "Bayar Sekarang"}
                  </Tombol>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
