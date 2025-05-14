"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, PlusCircle, Trash2, LucideEdit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Helper Functions ---

// Parses a size string like "100 gram" into value and unit
const parseSizeString = (
  sizeStr: string | null | undefined
): { value: string; unit: string } => {
  if (!sizeStr) return { value: "", unit: "gram" }; // Default unit
  const match = sizeStr.match(/^(\d*\.?\d+)\s*([a-zA-Z%]+)$/);
  if (match) {
    return { value: match[1], unit: match[2] || "gram" };
  }
  // Fallback if no unit found, treat the whole string as value?
  // Or maybe assume a default unit if it's just a number
  if (sizeStr.match(/^\d*\.?\d+$/)) {
    return { value: sizeStr, unit: "gram" };
  }
  return { value: sizeStr, unit: "gram" }; // Default unit if parsing fails
};

// Formats a number string into currency format (e.g., 100000 -> 100.000)
const formatCurrency = (value: string | number): string => {
  const numStr = String(value).replace(/\./g, ""); // Remove existing dots
  if (isNaN(parseFloat(numStr))) return ""; // Return empty if not a valid number
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Removes formatting from currency string (e.g., "Rp100.000" -> "100000")
const unformatCurrency = (value: string): string => {
  return String(value).replace(/[^\d]/g, ""); // Remove everything except digits
};

// --- Interfaces ---
interface Size {
  id?: number;
  sizeValue: string;
  sizeUnit: string;
  price: string;
  qty: string;
}

interface CatalogItem {
  id: number;
  name: string;
  category: string;
  description: string;
  isEnabled: boolean;
  image: string | null;
  blurDataURL?: string | null;
  categorySlug: string;
  productSlug: string;
  sizes: {
    id: number;
    size: string;
    price: string;
    qty: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

// --- Component ---
const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Partial<Omit<CatalogItem, "sizes">>>(
    {}
  );
  const [sizes, setSizes] = useState<Size[]>([
    { sizeValue: "", sizeUnit: "gram", price: "", qty: "" },
  ]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableUnits = ["gram", "kg", "pcs", "ml", "liter", "cm", "meter", "custom"];

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      const url = `${process.env.NEXT_PUBLIC_API_URL}/catalog/${id}`;

      try {
        const response = await axios.get<CatalogItem>(url);
        const { sizes: backendSizes, ...productData } = response.data;
        setProduct(productData);

        // Parse backend sizes into frontend format
        setSizes(
          backendSizes?.map((s) => {
            const parsedSize = parseSizeString(s.size);
            const price = unformatCurrency(s.price);
            return {
              id: s.id,
              sizeValue: parsedSize.value,
              sizeUnit: parsedSize.unit,
              price: price,
              qty: String(s.qty),
            };
          }) || [{ sizeValue: "", sizeUnit: "gram", price: "", qty: "" }]
        );

        setExistingImageUrl(productData.image);
        if (productData.image) {
          const fullImageUrl = `${process.env.NEXT_PUBLIC_API_URL}${productData.image}`;
          setImagePreview(fullImageUrl);
        } else {
          setImagePreview(null);
        }
      } catch (err: any) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to load product data.";
        setError(`Failed to load product data: ${message}`);
        toast.error(`Load failed: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleInputChange = (
    field: keyof Omit<CatalogItem, "sizes">,
    value: string | boolean
  ) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleSizeChange = (
    index: number,
    field: keyof Size,
    value: string
  ) => {
    const newSizes = [...sizes];
    const currentSize = { ...newSizes[index] };

    if (field === "price") {
      currentSize.price = unformatCurrency(value);
    } else if (field === "sizeValue") {
      if (currentSize.sizeUnit === "custom") {
        currentSize.sizeValue = value; // Allow any text for custom size
      } else {
        currentSize.sizeValue = value.replace(/[^\d.]/g, "");
      }
    } else if (field === "qty") {
      currentSize.qty = value;
    }

    newSizes[index] = currentSize;
    setSizes(newSizes);
  };

  const handleUnitChange = (index: number, unit: string) => {
    const newSizes = [...sizes];
    newSizes[index].sizeUnit = unit;
    setSizes(newSizes);
  };

  const addSizeField = () => {
    setSizes([
      ...sizes,
      { sizeValue: "", sizeUnit: "gram", price: "", qty: "" },
    ]);
  };

  const removeSizeField = (index: number) => {
    const sizeToRemove = sizes[index];
    if (sizeToRemove && !sizeToRemove.id) {
      const newSizes = sizes.filter((_, i) => i !== index);
      setSizes(newSizes);
    } else if (sizeToRemove && sizeToRemove.id) {
      toast.info(
        "Cannot remove saved size. Backend deletion feature not implemented."
      );
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImagePreview(
        existingImageUrl
          ? `${process.env.NEXT_PUBLIC_API_URL}${existingImageUrl}`
          : null
      );
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    setIsUpdating(true);
    setError(null);

    // --- Start Validation ---
    let validationError: string | null = null;
    const sizesToSend = [];

    for (let i = 0; i < sizes.length; i++) {
      const s = sizes[i];
      const priceNum = parseFloat(s.price);
      const qtyNum = parseInt(s.qty, 10);
      const sizeValueNum = parseFloat(s.sizeValue);

      if (s.sizeUnit === "custom") {
        // For custom sizes, just make sure the size name is not empty
        if (!s.sizeValue || s.sizeValue.trim() === "") {
          validationError = `Size row #${i + 1}: Size name cannot be empty.`;
          break;
        }
      } else {
        // For numeric sizes, validate that it's a positive number
        if (!s.sizeValue || isNaN(sizeValueNum) || sizeValueNum <= 0) {
          validationError = `Size row #${i + 1}: Invalid Size value. Please enter a positive number.`;
          break;
        }
      }
      
      if (!s.sizeUnit) {
        validationError = `Size row #${i + 1}: Please select a Unit.`;
        break;
      }
      if (s.price === "" || isNaN(priceNum) || priceNum < 0) {
        validationError = `Size row #${i + 1}: Invalid Price. Please enter a non-negative number.`;
        break;
      }
      if (s.qty === "" || isNaN(qtyNum) || qtyNum < 0) {
        validationError = `Size row #${i + 1}: Invalid Qty. Please enter a whole non-negative number.`;
        break;
      }

      sizesToSend.push({
        id: s.id,
        size: `${s.sizeValue} ${s.sizeUnit}`,
        price: String(priceNum),
        qty: String(qtyNum),
      });
    }

    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      setIsUpdating(false);
      return;
    }
    // --- End Validation ---

    const formData = new FormData();

    if (product.name !== undefined) formData.append("name", product.name);
    if (product.category !== undefined)
      formData.append("category", product.category);
    if (product.description !== undefined)
      formData.append("description", product.description);
    if (product.isEnabled !== undefined)
      formData.append("isEnabled", String(product.isEnabled));

    formData.append("sizes", JSON.stringify(sizesToSend));

    if (image) {
      formData.append("image", image);
    }

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/catalog/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Product updated successfully!");
      router.push("/admin/dashboard/products");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to update product.";
      setError(message);
      toast.error(`Update failed: ${message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="grid gap-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-32" />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error && !product.id) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-red-600 text-xl mb-4">Error loading product data!</p>
        <p className="text-gray-700 mb-6">{error}</p>
        <Link href="/admin/products">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  // --- Main Form Render ---
  return (
    <div className="container mx-auto py-10">
      <Link
        href="/admin/dashboard/products"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Products
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <LucideEdit size={36} className="text-blue-600" />
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>
              Product Details {product.id ? `(ID: ${product.id})` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={product.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={product.category || ""}
                onChange={(e) => handleInputChange("category", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={product.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                required
              />
            </div>

            <div className="grid gap-4">
              <Label className="text-base font-medium">Sizes and Pricing</Label>
              {sizes.length > 0 ? (
                sizes.map((sizeItem, index) => (
                  <div
                    key={sizeItem.id || `new-${index}`}
                    className="flex flex-wrap items-end gap-3 p-3 border rounded-md bg-gray-50/80 relative"
                  >
                    {sizeItem.id && <input type="hidden" value={sizeItem.id} />}

                    <div className="grid gap-1.5 flex-1 min-w-[100px]">
                      <Label htmlFor={`sizeValue-${index}`} className="text-xs">
                        {sizeItem.sizeUnit === "custom" ? "Size Name" : "Value"}
                      </Label>
                      <Input
                        id={`sizeValue-${index}`}
                        type="text"
                        value={
                          sizeItem.sizeUnit === "custom" 
                            ? sizeItem.sizeValue 
                            : sizeItem.sizeValue || ""
                        }
                        onChange={(e) =>
                          handleSizeChange(index, "sizeValue", e.target.value)
                        }
                        required
                        className="text-sm"
                        placeholder={sizeItem.sizeUnit === "custom" ? "e.g., Large" : "e.g., 100"}
                      />
                    </div>

                    <div className="grid gap-1.5 min-w-[100px]">
                      <Label htmlFor={`sizeUnit-${index}`} className="text-xs">
                        Unit
                      </Label>
                      <Select
                        value={sizeItem.sizeUnit}
                        onValueChange={(value) =>
                          handleUnitChange(index, value)
                        }
                        required
                      >
                        <SelectTrigger
                          id={`sizeUnit-${index}`}
                          className="text-sm w-full"
                        >
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUnits.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-1.5 flex-1 min-w-[150px]">
                      <Label htmlFor={`price-${index}`} className="text-xs">
                        Price (IDR)
                      </Label>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-1.5 pl-3 py-2 border border-r-0 rounded-l-md bg-gray-100">
                          Rp
                        </span>
                        <Input
                          id={`price-${index}`}
                          type="text"
                          value={
                            sizeItem.price ? formatCurrency(sizeItem.price) : ""
                          }
                          onChange={(e) =>
                            handleSizeChange(index, "price", e.target.value)
                          }
                          required
                          className="text-sm rounded-l-none"
                          placeholder="e.g., 100.000"
                        />
                      </div>
                    </div>

                    <div className="grid gap-1.5 w-24">
                      <Label htmlFor={`qty-${index}`} className="text-xs">
                        Qty
                      </Label>
                      <Input
                        id={`qty-${index}`}
                        type="number"
                        value={sizeItem.qty || ""}
                        onChange={(e) =>
                          handleSizeChange(index, "qty", e.target.value)
                        }
                        required
                        min="0"
                        className="text-sm"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-100 self-center mt-4"
                      onClick={() => removeSizeField(index)}
                      aria-label="Remove size"
                      disabled={sizes.length <= 1 && !!sizeItem.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No sizes added yet.
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSizeField}
                className="mt-2 w-fit"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Size
              </Button>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">
                Product Image (Leave blank to keep current)
              </Label>
              <Input
                id="image"
                type="file"
                onChange={handleImageChange}
                accept="image/*"
              />
              {imagePreview && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Image Preview:</p>
                  <Image
                    src={imagePreview}
                    alt={product?.name || "Product image preview"}
                    width={200}
                    height={200}
                    className="mt-2 rounded-md object-cover border"
                    priority
                    onError={(e) => {
                      e.currentTarget.src = "/blurry.svg";
                      e.currentTarget.srcset = "";
                    }}
                  />
                </div>
              )}
              {!imagePreview && existingImageUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Current Image:</p>
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}${existingImageUrl}`}
                    alt={product?.name || "Current product image"}
                    width={200}
                    height={200}
                    className="mt-2 rounded-md object-cover border"
                    priority
                    onError={(e) => {
                      e.currentTarget.src = "/blurry.svg";
                      e.currentTarget.srcset = "";
                    }}
                  />
                </div>
              )}
              {!imagePreview && !existingImageUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">No image uploaded.</p>
                  <Image
                    src="/placeholder-image.webp"
                    alt="No image placeholder"
                    width={200}
                    height={200}
                    className="mt-2 rounded-md object-cover border bg-gray-100"
                    priority
                  />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isEnabled"
                checked={!!product.isEnabled}
                onCheckedChange={(checked) =>
                  handleInputChange("isEnabled", Boolean(checked))
                }
              />
              <Label
                htmlFor="isEnabled"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Product Enabled
              </Label>
            </div>
            {error && !isLoading && (
              <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                Update Error: {error}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Link href="/admin/products">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Product"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default EditProductPage;
