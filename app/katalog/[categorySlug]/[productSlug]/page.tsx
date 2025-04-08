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
}

const ProductDetailPage = () => {
  const [product, setProduct] = useState<Catalog | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
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
        if (response.data.sizes && response.data.sizes.length > 0) {
          // Ensure sizes is defined
          setSelectedSize(response.data.sizes[0]);
        }
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

    const isLoggedIn = localStorage.getItem("user") !== null;
    isLoggedIn ? handleAddToLoggedInCart() : handleAddToGuestCart();
  };

  const handleAddToLoggedInCart = async () => {
    try {
      if (!selectedSize || !product || !product.image) return; // Ensure product.image is not null

      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData.id || 0;

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/cart/add`, {
        userId,
        catalogId: product.id,
        sizeId: selectedSize.id,
        quantity: 1,
      });

      await fetchCartData(userId);
      toast.success("Item berhasil ditambahkan ke keranjang!");
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Gagal menambahkan item ke keranjang");
    }
  };

  const getOrCreateGuestId = async (): Promise<string | null> => {
    let guestId = localStorage.getItem("guestId");

    if (!guestId) {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/cart/guest-session`
        );
        guestId = res.data.guestId;
        if (guestId) {
          localStorage.setItem("guestId", guestId);
        }
      } catch (error) {
        console.error("Error creating guest session:", error);
        return null;
      }
    }

    return guestId;
  };

  const handleAddToGuestCart = async () => {
    try {
      if (!product || !selectedSize || !product.image) return;

      const guestId = await getOrCreateGuestId();
      if (!guestId) {
        toast.error("Failed to create guest session");
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/add`,
        {
          guestId,
          catalogId: product.id,
          sizeId: selectedSize.id,
          quantity: 1,
        }
      );

      if (response.data.success) {
        if (response.data.data) {
          localStorage.setItem("cart", JSON.stringify(response.data.data));
        }
        setIsCartModalOpen(true);
        toast.success("Item berhasil ditambahkan ke keranjang!");
      } else {
        throw new Error(
          response.data.message || "Gagal menambahkan item ke keranjang"
        );
      }
    } catch (error) {
      const err = error as Error;
      console.error("Error adding item to cart:", err);
      toast.error(err.message || "Gagal menambahkan item ke keranjang");
    }
  };

  const fetchCartData = async (userId?: number) => {
    try {
      let url = "";

      if (userId) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/cart/findMany?userId=${userId}`;
      } else {
        const guestId = localStorage.getItem("guestId");
        if (!guestId) return;
        url = `${process.env.NEXT_PUBLIC_API_URL}/cart/findMany?guestId=${guestId}`;
      }

      const response = await axios.get(url);
      if (response.data) {
        localStorage.setItem("cart", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
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
                }/catalog/images/${product.image.split("/").pop()!}`} // Non-null assertion
                alt={product.name || "Product Image"}
                width={500}
                height={500}
                className="rounded-xl"
              />
            )
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="lg:w-1/2 w-full mt-4 lg:mt-0">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded-md w-3/4 animate-pulse" />
            <div className="h-20 bg-gray-200 rounded-md animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded-md w-1/4 animate-pulse" />
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 rounded-md animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold">{product?.name}</h1>
            <p className="text-gray-600 mt-2">{product?.description}</p>

            {product?.sizes &&
              product.sizes.length > 0 && ( // Ensure sizes is defined
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

      {/* Cart Confirmation Modal */}
      <Modal
        closeButton
        aria-labelledby="modal-title"
        isOpen={isCartModalOpen}
        onClose={handleCloseCartModal}
        className="max-w-[400px] w-full"
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
