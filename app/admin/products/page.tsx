"use client";

import { Badge } from "@/components/ui/badge";
import Blurry from "@/public/blurry.svg";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@heroui/link";
import { LucidePackage, LucidePlus } from "lucide-react";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  status: "available" | "unavailable";
}

const products: Product[] = [
  {
    id: 1,
    name: "Black Forest Cake",
    category: "Cakes",
    price: "Rp120,000",
    status: "available",
  },
  {
    id: 2,
    name: "Macarons",
    category: "Desserts",
    price: "Rp45,000",
    status: "unavailable",
  },
  {
    id: 3,
    name: "Cheesecake",
    category: "Cakes",
    price: "Rp150,000",
    status: "available",
  },
];

export default function ProductsPage() {
  return (
    <div className="relative min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <LucidePackage size={36} className="text-blue-600" />
            <h1 className="text-2xl font-bold">Products Management</h1>
          </div>
          <Link href="/admin/products/add">
            <Button variant="default" className="flex items-center gap-2">
              <LucidePlus size={16} />
              Add Product
            </Button>
          </Link>
        </div>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[5%]">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.status === "available" ? "default" : "destructive"
                    }
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href="products/edit">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
