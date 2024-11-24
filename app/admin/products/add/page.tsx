"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FileInput } from "@/components/file-input";

const AddProductPage = () => {
  const [formData, setFormData] = useState({
    productName: "",
    productCategory: "",
    productPrice: "",
    productStatus: true, // Default: available
    productImage: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value, // Update data dari input
    }));
  };

  const handleSwitchChange = (value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      productStatus: value, // Update status ketersediaan
    }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      productImage: file, // Update file yang diupload
    }));
  };

  const handleSubmit = () => {
    console.log("Form Data:", formData);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <form className="space-y-4">
        <div>
          <label htmlFor="product-name" className="block text-sm font-medium">
            Product Name
          </label>
          <Input
            id="product-name"
            name="productName"
            placeholder="Enter product name"
            value={formData.productName}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label
            htmlFor="product-category"
            className="block text-sm font-medium"
          >
            Product Category
          </label>
          <Input
            id="product-category"
            name="productCategory"
            placeholder="Enter product category"
            value={formData.productCategory}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="product-price" className="block text-sm font-medium">
            Product Price (Rp)
          </label>
          <Input
            id="product-price"
            name="productPrice"
            placeholder="Enter product price"
            value={formData.productPrice}
            onChange={(e) => {
              const formattedValue = e.target.value.replace(/\D/g, ""); // Hanya angka
              setFormData((prev) => ({
                ...prev,
                productPrice: formattedValue.replace(
                  /\B(?=(\d{3})+(?!\d))/g,
                  "."
                ), // Format angka
              }));
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Product Status
          </label>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.productStatus}
              onCheckedChange={handleSwitchChange}
            />
            <span>{formData.productStatus ? "Available" : "Unavailable"}</span>
          </div>
        </div>

        <div>
          <label htmlFor="product-image" className="block text-sm font-medium">
            Product Image
          </label>
          <FileInput
            id="product-image"
            name="productImage"
            onChange={handleFileChange}
            acceptedFileTypes={["image/png", "image/jpeg"]}
          />
        </div>

        <Button type="button" onClick={handleSubmit} className="w-full">
          Add Product
        </Button>
      </form>
    </div>
  );
};

export default AddProductPage;
