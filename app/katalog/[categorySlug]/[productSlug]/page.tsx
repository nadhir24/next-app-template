"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { RadioGroup, Radio } from "@nextui-org/radio";
import { toast, Toaster } from "sonner";
import { useDisclosure } from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import DynamicImage from "@/components/dynamic-imae";

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
  const [imageError, setImageError] = useState<boolean>(false);
  const params = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const categorySlug = params.categorySlug as string;
  const productSlug = Array.isArray(params.productSlug)
    ? params.productSlug.join("/")
    : params.productSlug;

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get<Catalog>(
          `http://localhost:5000/catalog/${categorySlug}/${productSlug}`
        );
        setProduct(response.data);

        if (response.data.sizes.length > 0) {
          setSelectedSize(response.data.sizes[0]);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Failed to load product details.");
      }
    };

    if (categorySlug && productSlug) {
      fetchProductDetail();
    }
  }, [categorySlug, productSlug]);

  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sizeId = event.target.value;
    const selected = product?.sizes.find((size) => size.id.toString() === sizeId);
    setSelectedSize(selected || null);
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Please select a size before adding to cart.");
      return;
    }

    const isLoggedIn = false; // Replace with actual login check

    if (isLoggedIn) {
      try {
        await axios.post("http://localhost:5000/cart/add", {
          userId: 1, // Adjust based on your auth logic
          catalogId: product?.id || 0,
          sizeId: selectedSize.id,
          quantity: 1,
        });
        toast.success("Item added to cart!");
      } catch (error) {
        console.error("Error adding item to cart:", error);
        toast.error("Failed to add item to cart.");
      }
    } else {
      const guestCart: GuestCartItem[] = JSON.parse(localStorage.getItem("guestCart") || "[]");

      const existingItem = guestCart.find(
        (item) => item.catalogId === (product?.id || 0) && item.sizeId === selectedSize.id
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        guestCart.push({
          catalogId: product?.id || 0,
          name: product?.name || "",
          image: product?.image || null,
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

  return (
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
            <a href={`/category/${categorySlug}`} className="hover:text-blue-600">
              {categorySlug}
            </a>
          </li>
          <li>/</li>
          <li className="font-semibold text-gray-800">{product?.name}</li>
        </ol>
      </nav>

      <div className="relative w-full aspect-square">
        {product?.image && (
          <DynamicImage
            url={`http://localhost:5000/catalog/images/${product.image.split("/").pop()}`}
            alt={product.name || "Product Image"}
            containerClass="rounded-xl"
          />
        )}
        {imageError && <p>Error loading image.</p>}
      </div>

      <h1 className="text-2xl font-bold mt-4">{product?.name}</h1>
      <p className="text-gray-600 mt-2">{product?.description}</p>

      {product?.sizes && product.sizes.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Select Size:</h2>
          <RadioGroup className="mt-2" value={selectedSize?.id.toString()} onChange={handleSizeChange}>
            {product.sizes.map((size) => (
              <Radio key={size.id} value={size.id.toString()}>
                {size.size} - Rp{size.price}
              </Radio>
            ))}
          </RadioGroup>
        </div>
      )}

      <Button onClick={handleAddToCart} className="mt-4" color="primary">
        Add to Cart
      </Button>

      <Toaster />
    </div>
  );
};

export default ProductDetailPage;
