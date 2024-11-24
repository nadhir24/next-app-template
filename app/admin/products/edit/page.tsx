"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { LucideEdit, LucideArrowLeft } from "lucide-react";

export default function EditProductPage() {
  // Simulasi data produk yang sedang diedit
  const [productName, setProductName] = useState("Black Forest Cake");
  const [category, setCategory] = useState("cakes");
  const [price, setPrice] = useState("Rp120,000");
  const [status, setStatus] = useState(true);

  const handleUpdateProduct = () => {
    // Simulasi logika untuk mengupdate produk
    console.log({ productName, category, price, status });
    alert("Product updated successfully!");
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      {/* Logo Header */}
      <div className="flex items-center gap-3 mb-6">
        <LucideEdit size={36} className="text-yellow-600" />
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

      {/* Form */}
      <form className="space-y-4">
        {/* Nama Produk */}
        <div>
          <Label htmlFor="productName">Product Name</Label>
          <Input
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        {/* Kategori */}
        <div>
          <Label htmlFor="category">Category</Label>
          <Select onValueChange={setCategory} value={category}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cakes">Cakes</SelectItem>
              <SelectItem value="desserts">Desserts</SelectItem>
              <SelectItem value="drinks">Drinks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Harga */}
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <Label>Status</Label>
          <div className="flex items-center gap-2">
            <span className={status ? "text-green-500" : "text-red-500"}>
              {status ? "Available" : "Unavailable"}
            </span>
            <Switch checked={status} onCheckedChange={setStatus} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => history.back()}
          >
            <LucideArrowLeft size={16} />
            Cancel
          </Button>
          <Button variant="default" onClick={handleUpdateProduct}>
            Update Product
          </Button>
        </div>
      </form>
    </div>
  );
}
