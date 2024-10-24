"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { RadioGroup, Radio } from "@nextui-org/radio";
import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";

import { toast, Toaster } from "sonner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";

// Define interface for Size, Catalog, and Guest Cart Item
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
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const params = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const categorySlug = params.categorySlug as string;
  const productSlug = Array.isArray(params.productSlug)
    ? params.productSlug.join("/")
    : params.productSlug;

  // Fetch product details based on category and product slug
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get<Catalog>(
          `http://localhost:5000/catalog/${categorySlug}/${productSlug}`
        );
        setProduct(response.data);

        // Set default selected size if sizes are available
        if (response.data.sizes.length > 0) {
          setSelectedSize(response.data.sizes[0]);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Failed to load product details."); // Notify user of the error
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    if (categorySlug && productSlug) {
      fetchProductDetail();
    }
  }, [categorySlug, productSlug]);

  // Handle size selection change
  const handleSizeChange = (sizeId: string) => {
    const selected = product?.sizes.find(
      (size) => size.id === parseInt(sizeId)
    );
    setSelectedSize(selected || null);
  };

  // Add selected item to cart
  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Please select a size before adding to cart.");
      return;
    }

    const isLoggedIn = false; // Simulate user login check

    if (isLoggedIn) {
      // Logged-in user flow
      try {
        await axios.post("http://localhost:5000/cart/add", {
          userId: 1, // Replace with actual user ID
          catalogId: product?.id || 0, // Fallback to 0 if undefined
          sizeId: selectedSize.id,
          quantity: 1,
        });
        toast.success("Item added to cart!");
      } catch (error) {
        console.error("Error adding item to cart:", error);
        toast.error("Failed to add item to cart.");
      }
    } else {
      // Guest user flow
      const guestCart: GuestCartItem[] =
        JSON.parse(localStorage.getItem("guestCart") || "[]") || [];

      const existingItem = guestCart.find(
        (item) =>
          item.catalogId === (product?.id || 0) &&
          item.sizeId === selectedSize.id
      );

      if (existingItem) {
        existingItem.quantity += 1; // Increment quantity if item exists
      } else {
        // Add new item to guest cart
        guestCart.push({
          catalogId: product?.id || 0, // Fallback to 0 if undefined
          name: product?.name || "", // Fallback to empty string if undefined
          image: product?.image || null, // Fallback to null if undefined
          sizeId: selectedSize.id,
          size: selectedSize.size,
          price: selectedSize.price,
          quantity: 1,
        });
      }

      localStorage.setItem("guestCart", JSON.stringify(guestCart));
      toast.success("Item added to guest cart!");
    }
  };

  if (loading) {
    return <Spinner color="primary" />;
  }

  return (
    <div className="product-detail flex flex-col lg:flex-row sm:flex-col md:flex-row">
      {product ? (
        <>
          {/* Left Side - Image Section */}
          <div className="flex flex-col lg:basis-4/6 md:basis-3/5 sm:basis-full p-4">
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
                <li className="font-semibold text-gray-800">{product.name}</li>
              </ol>
            </nav>

            {/* Product Image */}
            <Image
              src={`http://localhost:5000/catalog/images/${
                product.image?.split("/").pop() || ""
              }`} // Fallback to empty string if undefined
              alt={product.name || "Product Image"} // Fallback to default alt text
              width={256}
              height={270}
              className="w-full h-auto object-cover rounded-xl"
            />
          </div>

          {/* Right Side - Product Details */}
          <form className="flex flex-col lg:basis-2/6 md:basis-2/5 sm:basis-full p-4">
            <div className="mb-6 border-b pb-6 mt-8">
              <h1 className="text-3xl font-medium">{product.name || ""}</h1>
              <p className="mt-2 text-gray-700">{product.description}</p>
              <p className="mt-4">Produk tersedia: {product.qty}</p>

              {/* Size Selection */}
              <RadioGroup
                value={selectedSize?.id.toString() || ""}
                onValueChange={handleSizeChange}
                label="Pilih Ukuran"
                className="mt-4"
              >
                {product.sizes.map((size) => (
                  <Radio key={size.id} value={size.id.toString()}>
                    {size.size} - {size.price}
                  </Radio>
                ))}
              </RadioGroup>

              {/* Modal for additional actions */}
              <Button onPress={onOpen}>Open Modal</Button>
              <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Modal Title
                      </ModalHeader>
                      <ModalBody>
                        <p>Additional content inside the modal.</p>
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          color="danger"
                          variant="light"
                          onPress={onClose}
                        >
                          Close
                        </Button>
                        <Button color="primary" onPress={onClose}>
                          Action
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>

              {/* Short Message Input */}
              <Input
                type="text"
                label="Pesan Singkat"
                placeholder="Maks 25 karakter"
                className="mt-4"
                maxLength={25} // Limit input length
              />

              {/* Add to Cart Button */}
              <Button onClick={handleAddToCart} className="mt-6">
                Tambah ke Keranjang
              </Button>
              <Toaster position="top-left" richColors />
            </div>
          </form>
        </>
      ) : (
        <Spinner color="primary" />
      )}
    </div>
  );
};

export default ProductDetailPage;
