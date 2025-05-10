"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PencilIcon, Trash2Icon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";

interface Size {
  id: number;
  size: string;
  price: number;
  qty: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  categorySlug: string;
  image: string;
  isEnabled: boolean;
  productSlug: string;
  sizes: Size[];
}

interface ProductsResponse {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const router = useRouter();
  const { toast, dismiss } = useToast();
  const ITEMS_PER_PAGE = 10;

  const fetchProducts = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/products?page=${page}&limit=${ITEMS_PER_PAGE}`
      );
      const data: ProductsResponse = await response.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleDelete = async (productId: number) => {
    setProductToDelete(productId);

    await Promise.resolve();

    const toastId = toast({
      title: "Delete Product",
      description: "Are you sure you want to delete this product?",
      variant: "destructive",
      duration: 5000,
      action: (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              dismiss(toastId.id);
              setProductToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              dismiss(toastId.id);
              await confirmDelete(productId);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    });
  };

  const confirmDelete = async (id: number) => {
    if (!id || typeof id !== "number" || isNaN(id)) {
      toast({
        title: "Error",
        description: "Invalid product ID provided.",
        variant: "destructive",
      });
      setProductToDelete(null);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not found",
          variant: "destructive",
          duration: 3000,
        });
      } else {
        const deleteUrl = `${process.env.NEXT_PUBLIC_API_URL}/catalog/${id}`;

        const response = await fetch(deleteUrl, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        let responseData = null;
        if (!response.ok) {
          try {
            responseData = await response.json();

            // Cek apakah error karena produk ada di keranjang
            if (
              response.status === 409 &&
              responseData?.message?.includes("cart")
            ) {
              // Tampilkan dialog untuk konfirmasi force delete
              const forceToastId = toast({
                title: "Product In Cart",
                description:
                  "This product can't be deleted because it's in customer carts. Do you want to force delete it? This will remove the product from all carts.",
                variant: "destructive",
                duration: 10000,
                action: (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        dismiss(forceToastId.id);
                        setProductToDelete(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        dismiss(forceToastId.id);
                        await forceDelete(id);
                      }}
                    >
                      Force Delete
                    </Button>
                  </div>
                ),
              });
              return;
            }

            throw new Error(
              responseData?.message ||
                `Failed to delete product (status: ${response.status})`
            );
          } catch (parseError) {
            throw new Error(
              `Failed to delete product and parse error response (status: ${response.status})`
            );
          }
        } else {
          try {
            responseData = await response.json();
          } catch (parseError) {
            responseData = null;
          }
        }

        toast({
          title: "Success",
          description: "Product deleted successfully",
          variant: "default",
          duration: 3000,
        });

        await fetchProducts(currentPage);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setProductToDelete(null);
    }
  };

  // Tambahkan fungsi baru untuk force delete
  const forceDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not found",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      const forceDeleteUrl = `${process.env.NEXT_PUBLIC_API_URL}/catalog/${id}/force`;

      const response = await fetch(forceDeleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData?.message ||
            `Failed to force delete product (status: ${response.status})`
        );
      }

      const responseData = await response.json();

      toast({
        title: "Success",
        description: `Product deleted successfully. ${responseData.count || 0} items were removed from carts.`,
        variant: "default",
        duration: 3000,
      });

      await fetchProducts(currentPage);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to force delete product",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setProductToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button
          onClick={() => router.push("/admin/dashboard/products/add")}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Add Product"}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Starting Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const minPrice = Math.min(
                  ...product.sizes.map((size) => size.price)
                );
                const isAvailable = product.sizes.some((size) => size.qty > 0);

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative w-16 h-16">
                        <Image
                          src={
                            product.image
                              ? `${process.env.NEXT_PUBLIC_API_URL}${product.image}`
                              : "/default-product.jpg"
                          }
                          alt={product.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatPrice(minPrice)}</TableCell>
                    <TableCell>
                      <span
                        className={`font-bold ${isAvailable ? "text-green-600" : "text-red-600"}`}
                      >
                        {isAvailable ? "Available" : "Out of Stock"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu
                        onOpenChange={(isOpen) => {
                          if (!isOpen && productToDelete === product.id) {
                            setProductToDelete(null);
                          }
                        }}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingId(product.id);
                              router.push(
                                `/admin/dashboard/products/edit/${product.id}`
                              );
                            }}
                            textValue="Edit"
                          >
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              disabled={editingId === product.id}
                            >
                              {editingId === product.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Editing...
                                </>
                              ) : (
                                <>
                                  <PencilIcon className="mr-2 h-4 w-4" />
                                  Edit
                                </>
                              )}
                            </Button>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 focus:bg-red-100 focus:text-red-700"
                            disabled={productToDelete === product.id}
                            textValue="Delete"
                          >
                            {productToDelete === product.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2Icon className="mr-2 h-4 w-4" />
                                Delete
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && products.length > 0 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
