"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, PlusCircle, Trash2, Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formatCurrency = (value: string | number): string => {
  const numStr = String(value).replace(/\./g, "");
  if (isNaN(parseFloat(numStr))) return "";
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const unformatCurrency = (value: string): string => {
  return String(value).replace(/\./g, "");
};

interface Size {
  sizeValue: string;
  sizeUnit: string;
  price: string;
  qty: string;
}

const AddProductPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [sizes, setSizes] = useState<Size[]>([
    { sizeValue: "", sizeUnit: "gram", price: "", qty: "" },
  ]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableUnits = ["gram", "kg", "pcs", "ml", "liter", "cm", "meter", "custom"];

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
        currentSize.sizeValue = value;
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
    if (sizes.length > 1) {
      const newSizes = sizes.filter((_, i) => i !== index);
      setSizes(newSizes);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setImages(prevImages => [...prevImages, ...selectedFiles]);
      
      // Create preview URLs for new images
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreview(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
  };
  
  const removeImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setImagePreview(prevPreviews => {
      // Release the object URL to prevent memory leaks
      URL.revokeObjectURL(prevPreviews[index]);
      return prevPreviews.filter((_, i) => i !== index);
    });
    
    // Adjust mainImageIndex if necessary
    if (index === mainImageIndex) {
      setMainImageIndex(0); // Reset to first image if main image is removed
    } else if (index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1); // Decrease index if an image before the main one is removed
    }
  };
  
  const setAsMainImage = (index: number) => {
    setMainImageIndex(index);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    let validationError: string | null = null;
    const sizesToSend = [];

    for (let i = 0; i < sizes.length; i++) {
      const s = sizes[i];
      const priceNum = parseFloat(s.price);
      const qtyNum = parseInt(s.qty, 10);
      const sizeValueNum = parseFloat(s.sizeValue);

      if (s.sizeUnit === "custom") {
        if (!s.sizeValue || s.sizeValue.trim() === "") {
          validationError = `Size row #${i + 1}: Size name cannot be empty.`;
          break;
        }
      } else {
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
        size: s.sizeUnit === "custom" 
          ? s.sizeValue // Untuk unit custom, hanya kirim nilai ukuran tanpa unit
          : `${s.sizeValue} ${s.sizeUnit}`,
        price: String(priceNum),
        qty: qtyNum,
      });
    }

    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      setIsLoading(false);
      return;
    }

    try {
      // Siapkan form data untuk API
      const formData = new FormData();

      // Tambahkan data sebagai string untuk memastikan tipe data benar
      formData.append("name", String(name));
      formData.append("category", String(category));
      formData.append("description", String(description));
      formData.append("isEnabled", String(isEnabled));
      formData.append("sizes", JSON.stringify(sizesToSend));
      formData.append("mainImageIndex", String(mainImageIndex));

      // Tambahkan semua gambar
      images.forEach(file => {
        formData.append("images", file);
      });

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/catalog`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Product added successfully!");
      router.push("/admin/dashboard/products");
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Failed to add product.";
      setError(message);
      toast.error(`Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Link
        href="/admin/dashboard/products"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Products
      </Link>
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., Chocolate Delight Cake"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                placeholder="e.g., Cakes, Pastries, Cookies"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe the product..."
              />
            </div>

            <div className="grid gap-4">
              <Label className="text-base font-medium">Sizes and Pricing</Label>
              {sizes.map((sizeItem, index) => (
                <div
                  key={index}
                  className="flex flex-wrap items-end gap-3 p-3 border rounded-md bg-gray-50/80 relative"
                >
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
                          : sizeItem.sizeValue
                            ? formatCurrency(sizeItem.sizeValue)
                            : ""
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
                      onValueChange={(value) => handleUnitChange(index, value)}
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
                        value={sizeItem.price ? formatCurrency(sizeItem.price) : ""}
                        onChange={(e) =>
                          handleSizeChange(index, "price", e.target.value)
                        }
                        required
                        className="text-sm"
                        placeholder="e.g., 100.000"
                      />
                    </div>
                  </div>
                  <div className="grid gap-1.5 flex-1 min-w-[100px]">
                    <Label htmlFor={`qty-${index}`} className="text-xs">
                      Qty
                    </Label>
                    <Input
                      id={`qty-${index}`}
                      type="text"
                      value={sizeItem.qty}
                      onChange={(e) =>
                        handleSizeChange(index, "qty", e.target.value)
                      }
                      required
                      className="text-sm"
                      placeholder="e.g., 10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSizeField(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={addSizeField}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="images">Product Images</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                multiple
              />
              <p className="text-xs text-gray-500 mt-1">
                You can select multiple images. The first image will be used as the main product image.
              </p>
              
              {imagePreview.length > 0 && (
                <div className="mt-4">
                  <Label className="block mb-2">Image Previews</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreview.map((src, index) => (
                      <div 
                        key={index} 
                        className={`relative border rounded-md overflow-hidden ${
                          index === mainImageIndex ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <div className="aspect-square relative">
                          <Image
                            src={src}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant={index === mainImageIndex ? "default" : "outline"}
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setAsMainImage(index)}
                            title="Set as main image"
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        </div>
                        {index === mainImageIndex && (
                          <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs py-1 text-center">
                            Main Image
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="isEnabled">Is Enabled</Label>
              <Checkbox
                id="isEnabled"
                checked={isEnabled}
                onCheckedChange={(value) => setIsEnabled(Boolean(value))}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Product"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default AddProductPage;
