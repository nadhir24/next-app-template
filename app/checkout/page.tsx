"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

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

  // Fungsi untuk mengambil data user jika sudah login
  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`
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
  const fetchCheckoutData = async (userId: string | null) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/checkout${
          userId ? `?userId=${userId}` : ""
        }`
      );
      if (!response.ok) throw new Error("Failed to fetch checkout data");

      const data = await response.json();
      setCheckoutData(data);
    } catch (error) {
      console.error("Error fetching checkout data:", error);
    }
  };

  // Effect untuk mengecek user login dan mengambil data
  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId");
    if (userIdFromStorage) {
      setUserId(userIdFromStorage);
      fetchUserData(userIdFromStorage);
    }
    fetchCheckoutData(userIdFromStorage);
  }, []);

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/snap/create-transaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            shippingAddress,
            items: checkoutData.items,
            total: checkoutData.total,
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Bagian */}
          <div className="space-y-8">
            {/* Contact Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Contact</h2>
                <button className="text-sm text-gray-600">Log in</button>
              </div>
              <input
                type="email"
                name="email"
                value={shippingAddress.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <div className="mt-3 flex items-center">
                <input
                  type="checkbox"
                  id="emailOffers"
                  checked={emailOffers}
                  onChange={(e) => setEmailOffers(e.target.checked)}
                  className="h-4 w-4 text-blue-600"
                />
                <label
                  htmlFor="emailOffers"
                  className="ml-2 text-sm text-gray-600"
                >
                  Email me with news and offers
                </label>
              </div>
            </div>

            {/* Delivery Section */}
            <div>
              <h2 className="text-lg font-medium mb-4">Delivery</h2>
              <select className="w-full p-3 border border-gray-300 rounded-md mb-4">
                <option value="indonesia">Indonesia</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  value={shippingAddress.firstName}
                  onChange={handleInputChange}
                  placeholder="First name"
                  className="p-3 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  name="lastName"
                  value={shippingAddress.lastName}
                  onChange={handleInputChange}
                  placeholder="Last name"
                  className="p-3 border border-gray-300 rounded-md"
                />
              </div>
              <input
                type="text"
                name="address"
                value={shippingAddress.address}
                onChange={handleInputChange}
                placeholder="Address"
                className="w-full p-3 border border-gray-300 rounded-md mt-4"
              />
              <input
                type="text"
                name="district"
                value={shippingAddress.district}
                onChange={handleInputChange}
                placeholder="District / Kecamatan"
                className="w-full p-3 border border-gray-300 rounded-md mt-4"
              />
              <input
                type="text"
                name="city"
                value={shippingAddress.city}
                onChange={handleInputChange}
                placeholder="City"
                className="w-full p-3 border border-gray-300 rounded-md mt-4"
              />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <select
                  name="province"
                  value={shippingAddress.province}
                  onChange={(e) =>
                    handleInputChange({
                      target: { name: "province", value: e.target.value },
                    } as any)
                  }
                  className="p-3 border border-gray-300 rounded-md"
                >
                  <option value="">Province</option>
                  <option value="jakarta">DKI Jakarta</option>
                  <option value="jawa-barat">Jawa Barat</option>
                </select>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleInputChange}
                  placeholder="Postal code"
                  className="p-3 border border-gray-300 rounded-md"
                />
              </div>
              <input
                type="tel"
                name="phone"
                value={shippingAddress.phone}
                onChange={handleInputChange}
                placeholder="Phone"
                className="w-full p-3 border border-gray-300 rounded-md mt-4"
              />
              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="saveInfo"
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="h-4 w-4 text-blue-600"
                />
                <label
                  htmlFor="saveInfo"
                  className="ml-2 text-sm text-gray-600"
                >
                  Save this information for next time
                </label>
              </div>
            </div>

            {/* Payment Section */}
            <div>
              <h2 className="text-lg font-medium mb-4">Payment</h2>
              <div className="border border-gray-300 rounded-md p-4">
                <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md mb-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 mr-2">
                      <Image
                        src="/xendit-logo.png"
                        alt="Xendit"
                        width={24}
                        height={24}
                      />
                    </div>
                    <span>Payments By Xendit</span>
                  </div>
                  <div className="flex space-x-2">
                    <Image src="/visa.png" alt="Visa" width={32} height={20} />
                    <Image
                      src="/mastercard.png"
                      alt="Mastercard"
                      width={32}
                      height={20}
                    />
                    <Image src="/jcb.png" alt="JCB" width={32} height={20} />
                    <Image
                      src="/amex.png"
                      alt="American Express"
                      width={32}
                      height={20}
                    />
                  </div>
                </div>
                <div className="text-center text-sm text-gray-600 mt-4">
                  <p>After clicking "Pay now", you will be redirected to</p>
                  <p>Payments By Xendit to complete your purchase</p>
                  <p>securely.</p>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="bankTransfer"
                    name="paymentMethod"
                    className="h-4 w-4 text-blue-600"
                  />
                  <label
                    htmlFor="bankTransfer"
                    className="ml-2 text-sm text-gray-600"
                  >
                    Manual Transfer - Bank BCA 375 577 8111 a.n. PT TENUE
                    DEATTIRE INDONESIA
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="bg-gray-50 p-6 rounded-lg">
            {checkoutData.items.map((item) => (
              <div key={item.id} className="flex items-center mb-6">
                <div className="relative w-16 h-16 bg-gray-200 rounded-md mr-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                  <span className="absolute -top-2 -right-2 bg-gray-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.size}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Rp {item.price.toLocaleString()}</p>
                </div>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp {checkoutData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  {checkoutData.shipping ? (
                    <span>Rp {checkoutData.shipping.toLocaleString()}</span>
                  ) : (
                    <span className="text-gray-600">
                      Enter shipping address
                    </span>
                  )}
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">
                    IDR Rp {checkoutData.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
