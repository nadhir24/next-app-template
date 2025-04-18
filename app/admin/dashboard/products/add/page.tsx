"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, PlusCircle, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formatCurrency = (value: string | number): string => {
  const numStr = String(value).replace(/\./g, '');
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
  const [sizes, setSizes] = useState<Size[]>([{ sizeValue: "", sizeUnit: "gram", price: "", qty: "" }]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableUnits = ["gram", "kg", "pcs", "ml", "liter", "cm", "meter"];

  const handleSizeChange = (
    index: number,
    field: keyof Size,
    value: string
  ) => {
    const newSizes = [...sizes];
    const currentSize = { ...newSizes[index] };

    if (field === 'price') {
        currentSize.price = unformatCurrency(value);
    } else if (field === 'sizeValue') {
        currentSize.sizeValue = value.replace(/[^\d.]/g, '');
    } else if (field === 'qty') {
        currentSize.qty = value;
    }

    newSizes[index] = currentSize;
    setSizes(newSizes);
  };

  const handleUnitChange = (index: number, unit: string) => {
      const newSizes = [...sizes];
      newSizes[index].sizeUnit = unit;
      setSizes(newSizes);
  }

  const addSizeField = () => {
    setSizes([...sizes, { sizeValue: "", sizeUnit: "gram", price: "", qty: "" }]);
  };

  const removeSizeField = (index: number) => {
    if (sizes.length > 1) {
      const newSizes = sizes.filter((_, i) => i !== index);
      setSizes(newSizes);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImagePreview(null);
    }
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

        if (!s.sizeValue || isNaN(sizeValueNum) || sizeValueNum <= 0) {
            validationError = `Size row #${i + 1}: Invalid Size value. Please enter a positive number.`;
            break;
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
            size: `${s.sizeValue} ${s.sizeUnit}`,
            price: String(priceNum),
            qty: qtyNum
        });
    }

    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("isEnabled", String(isEnabled));

    formData.append("sizes", JSON.stringify(sizesToSend));

    if (image) {
      formData.append("image", image);
    }

    try {
      console.log("Submitting FormData to POST /catalog/create");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/catalog/create`,
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
      console.error("Error adding product:", err);
      const message = err.response?.data?.message || err.message || "Failed to add product.";
      setError(message);
      toast.error(`Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Link href="/admin/products" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
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
                <div key={index} className="flex flex-wrap items-end gap-3 p-3 border rounded-md bg-gray-50/80 relative">
                  <div className="grid gap-1.5 flex-1 min-w-[100px]">
                    <Label htmlFor={`sizeValue-${index}`} className="text-xs">Value</Label>
                    <Input
                      id={`sizeValue-${index}`}
                      type="text"
                      value={sizeItem.sizeValue || ""}
                      onChange={(e) => handleSizeChange(index, "sizeValue", e.target.value)}
                      required
                      className="text-sm"
                      placeholder="e.g., 100"
                    />
                  </div>
                  <div className="grid gap-1.5 min-w-[100px]">
                      <Label htmlFor={`sizeUnit-${index}`} className="text-xs">Unit</Label>
                      <Select
                          value={sizeItem.sizeUnit}
                          onValueChange={(value) => handleUnitChange(index, value)}
                          required
                      >
                          <SelectTrigger id={`sizeUnit-${index}`} className="text-sm w-full">
                              <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                              {availableUnits.map(unit => (
                                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="grid gap-1.5 flex-1 min-w-[150px]">
                    <Label htmlFor={`price-${index}`} className="text-xs">Price (IDR)</Label>
                    <div className="flex items-center">
                         <span className="text-sm text-gray-500 mr-1.5 pl-3 py-2 border border-r-0 rounded-l-md bg-gray-100">Rp</span>
                         <Input
                           id={`price-${index}`}
                           type="text"
                           value={formatCurrency(sizeItem.price)}
                           onChange={(e) => handleSizeChange(index, "price", e.target.value)}
                           required
                           className="text-sm rounded-l-none"
                           placeholder="e.g., 100.000"
                         />
                    </div>
                  </div>
                  <div className="grid gap-1.5 w-24">
                    <Label htmlFor={`qty-${index}`} className="text-xs">Qty</Label>
                    <Input
                      id={`qty-${index}`}
                      type="number"
                      value={sizeItem.qty || ""}
                      onChange={(e) => handleSizeChange(index, "qty", e.target.value)}
                      required
                      min="0"
                      className="text-sm"
                      placeholder="e.g., 10"
                    />
                  </div>
                  {sizes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-100 self-center mt-4"
                      onClick={() => removeSizeField(index)}
                      aria-label="Remove size"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addSizeField} className="mt-2 w-fit">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Size
              </Button>
            </div>

             <div className="grid gap-2">
              <Label htmlFor="image">Product Image</Label>
              <Input id="image" type="file" onChange={handleImageChange} accept="image/*" />
               {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Image Preview" className="h-32 w-32 object-cover rounded-md border" />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isEnabled"
                checked={isEnabled}
                onCheckedChange={(checked) => setIsEnabled(Boolean(checked))}
              />
              <Label htmlFor="isEnabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Product Enabled
              </Label>
            </div>

            {error && (
                <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                    Error: {error}
                 </p>
             )}

          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding Product..." : "Add Product"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default AddProductPage;
