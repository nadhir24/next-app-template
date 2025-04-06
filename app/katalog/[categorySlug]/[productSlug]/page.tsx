"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { RadioGroup, Radio } from "@heroui/radio";
import { toast, Toaster } from "sonner";
import { Modal, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import router from "next/router";

interface Size {
  id: number;
  size: string;
  price: string;
}

interface Catalog {
  id: number;
  name: string;
  image: string | null;
  sizes: Size[];
  qty: string;
  description: string;
  blurDataURL?: string; // Optional field
}

interface GuestCartItem {
  catalogId: number;
  name: string;
  image: string | null;
  sizeId: number;
  size: string;
  price: string;
  quantity: number;
}

const ProductDetailPage = () => {
  const [product, setProduct] = useState<Catalog | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  const categorySlug = params.categorySlug as string;
  const productSlug = Array.isArray(params.productSlug)
    ? params.productSlug.join("/")
    : params.productSlug;

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<Catalog>(
          `${process.env.NEXT_PUBLIC_API_URL}/catalog/${categorySlug}/${productSlug}`
        );
        setProduct(response.data);
        if (response.data.sizes.length > 0) {
          setSelectedSize(response.data.sizes[0]);
        }
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        setGuestCart(guestCart);
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Failed to load product details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (categorySlug && productSlug) {
      fetchProductDetail();
    }
  }, [categorySlug, productSlug]);

  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sizeId = event.target.value;
    const selected = product?.sizes.find(
      (size) => size.id.toString() === sizeId
    );
    setSelectedSize(selected || null);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Silakan pilih ukuran terlebih dahulu");
      return;
    }

    const isLoggedIn = localStorage.getItem("user") !== null; // Cek login sebenarnya
    isLoggedIn ? handleAddToLoggedInCart() : handleAddToGuestCart();
  };

  const handleAddToLoggedInCart = async () => {
    try {
      // Tambahkan null check dan non-null assertion
      if (!selectedSize) {
        toast.error("Silakan pilih ukuran terlebih dahulu");
        return;
      }

      // Ambil data user dari localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData.id || 0;

      // Cek apakah item sudah ada di cart untuk menentukan quantity
      const existingCartItems = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );
      const existingItem = existingCartItems.find(
        (item: any) =>
          item.catalogId === product?.id && item.sizeId === selectedSize.id
      );

      // Jika item sudah ada, tambahkan quantity, jika belum ada set quantity ke 1
      const quantity = existingItem ? existingItem.quantity + 1 : 1;

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/cart/add`, {
        userId: userId,
        catalogId: product?.id || 0,
        sizeId: selectedSize.id, // Sekarang aman karena sudah dilakukan null check
        quantity: quantity,
      });

      // Fetch cart data setelah berhasil menambahkan item
      await fetchCartData(userId);

      toast.success("Item berhasil ditambahkan ke keranjang!");
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Gagal menambahkan item ke keranjang");
    }
  };

  // Fungsi untuk mengambil data cart dari server
  const fetchCartData = async (userId?: number) => {
    try {
      let url = "";
      if (userId) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/cart/findMany?userId=${userId}`;
      } else {
        const guestId = localStorage.getItem("guestId");
        if (guestId) {
          url = `${process.env.NEXT_PUBLIC_API_URL}/cart/findMany?guestId=${guestId}`;
        } else {
          return;
        }
      }

      const response = await axios.get(url);
      if (response.data) {
        // Update localStorage dengan data terbaru dari backend
        localStorage.setItem("cart", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };
  const handleAddToGuestCart = async () => {
    if (!product || !selectedSize) return;
    const productImage = product.image || "/default-product-image.jpg";

    const newItem: GuestCartItem = {
      catalogId: product.id,
      name: product.name,
      image: productImage, // Gunakan fallback jika null
      sizeId: selectedSize.id,
      size: selectedSize.size,
      price: selectedSize.price,
      quantity: 1,
    };

    setGuestCart((prevCart) => {
      // Cari item yang sama di cart sebelumnya
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.catalogId === newItem.catalogId && item.sizeId === newItem.sizeId
      );

      let newCart = [...prevCart];

      if (existingIndex > -1) {
        // Jika item sudah ada, tambahkan quantity
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + 1,
        };
      } else {
        // Jika item belum ada, tambahkan item baru
        newCart = [...newCart, newItem];
      }

      // Simpan ke localStorage
      localStorage.setItem("guestCart", JSON.stringify(newCart));
      return newCart;
    });

    // Fetch cart data untuk memperbarui tampilan keranjang
    await fetchCartData();

    setIsCartModalOpen(true);
    toast.success("Item berhasil ditambahkan ke keranjang!");
  };
  const handleCloseCartModal = () => {
    setIsCartModalOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:space-x-8 p-4">
      {/* Image Section */}
      <div className="lg:w-1/2 w-full">
        <nav className="flex mb-4">
          <ol className="flex space-x-2 text-gray-600">
            <li>
              <a href="/" className="hover:text-blue-600">
                Home
              </a>
            </li>
            <li>/</li>
            <li>
              <a
                href={`/category/${categorySlug}`}
                className="hover:text-blue-600"
              >
                {categorySlug}
              </a>
            </li>
            <li>/</li>
            <li className="font-semibold text-gray-800">{product?.name}</li>
          </ol>
        </nav>

        <div className="relative w-full aspect-square lg:aspect-auto">
          {isLoading ? (
            <div className="w-full h-full rounded-xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-[shimmer_1.5s_infinite] bg-[length:400%_100%]" />
          ) : (
            product?.image && (
              <Image
                src={`${
                  process.env.NEXT_PUBLIC_API_URL
                }/catalog/images/${product.image.split("/").pop()}`}
                alt={product.name || "Product Image"}
                width={500}
                height={500}
                className="rounded-xl"
              />
            )
          )}
        </div>
      </div>

      {/* Product Info Section */}
      <div className="lg:w-1/2 w-full mt-4 lg:mt-0">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded-md w-3/4 animate-pulse" />
            <div className="h-20 bg-gray-200 rounded-md animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded-md w-1/4 animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-200 rounded-md animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold">{product?.name}</h1>
            <p className="text-gray-600 mt-2">{product?.description}</p>

            {product?.sizes && product.sizes.length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold">Pilih Ukuran:</h2>
                <RadioGroup
                  className="mt-2"
                  value={selectedSize?.id.toString() || ""}
                  onChange={handleSizeChange}
                >
                  {product.sizes.map((size) => (
                    <Radio
                      key={size.id}
                      value={size.id.toString()}
                      className="mb-2 p-2 border rounded-md"
                    >
                      <span className="font-medium">{size.size}</span>
                      <span className="ml-2 text-primary">{size.price}</span>
                    </Radio>
                  ))}
                </RadioGroup>
              </div>
            )}

            <Button onClick={handleAddToCart} className="mt-4" color="primary">
              Add to Cart
            </Button>
          </>
        )}
      </div>

      {/* Modal for Cart Confirmation */}
      <Modal
        closeButton
        aria-labelledby="modal-title"
        isOpen={isCartModalOpen}
        onClose={handleCloseCartModal}
        className="max-w-[400px] w-full" // Ganti prop width dengan className
      >
        <ModalBody>
          <h3 className="text-xl font-bold mb-2">Item berhasil ditambahkan!</h3>
          <p>
            Kamu telah menambahkan {selectedSize?.size} {product?.name} ke
            keranjang
          </p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleCloseCartModal}>Close</Button>
          <Button onClick={() => router.push("/cart")}>View Cart</Button>
        </ModalFooter>
      </Modal>

      <Toaster />
    </div>
  );
};

export default ProductDetailPage;
