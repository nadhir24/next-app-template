"use client";
import { useEffect, useState } from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Button as NextUIButton } from "@heroui/button";
import { Input } from "@heroui/input";
import { Slider } from "@heroui/slider";
import { Skeleton } from "@heroui/skeleton";
import axios from "axios";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

interface Size {
  size: string;
  price: string;
}

interface Catalog {
  id: number;
  name: string;
  categorySlug: string;
  image: string | null;
  sizes: Size[];
  qty: string;
  productSlug: string;
  description: string;
}

interface FilterableCatalogProps {
  initialCategory?: string | null;
}

export default function FilterableCatalog({
  initialCategory,
}: FilterableCatalogProps) {
  const [filter, setFilter] = useState(initialCategory || "");
  const [filterByQuantity, setFilterByQuantity] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000000]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [filteredCatalogs, setFilteredCatalogs] = useState<Catalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingItemId, setProcessingItemId] = useState<number | null>(null);
  const [loadingItems, setLoadingItems] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Effect to apply initial filter immediately when catalogs are loaded and initialCategory exists
  useEffect(() => {
    if (initialCategory && catalogs.length > 0) {
      console.log(
        `[FilterableCatalog] Filtering by initialCategory: ${initialCategory}`
      );
      console.log("[FilterableCatalog] Raw catalogs data:", catalogs);

      // Normalisasi initialCategory (yang merupakan search query dari home)
      const normalizedSearchQuery = initialCategory
        .toLowerCase()
        .replace(/-/g, " "); // Tetap normalisasi spasi jika ada
      console.log(
        `[FilterableCatalog] Normalized search query: ${normalizedSearchQuery}`
      );

      // Log categorySlug dan name dari setiap katalog untuk debugging
      catalogs.forEach((catalog) => {
        console.log(
          `Catalog: ${catalog.name}, categorySlug: ${catalog.categorySlug}`
        );
      });

      // Filter berdasarkan nama produk ATAU categorySlug
      const filtered = catalogs.filter((catalog) => {
        const catalogNameNormalized = catalog.name.toLowerCase();
        const catalogCategoryNormalized = catalog.categorySlug
          .toLowerCase()
          .replace(/-/g, " ");
        // Cek apakah nama produk ATAU slug kategori mengandung query pencarian
        return (
          catalogNameNormalized.includes(normalizedSearchQuery) ||
          catalogCategoryNormalized.includes(normalizedSearchQuery)
        );
      });

      console.log(
        `[FilterableCatalog] Filtered catalogs count: ${filtered.length}`
      );
      setFilteredCatalogs(filtered);
    }
  }, [initialCategory, catalogs]);

  // Fetch catalog data from the API
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log(
          `[FilterableCatalog] Fetching catalogs from ${process.env.NEXT_PUBLIC_API_URL}/catalog/`
        );

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/catalog/`
        );
        setCatalogs(response.data);

        // Set filteredCatalogs berdasarkan initialCategory jika ada setelah fetch
        if (initialCategory) {
          const normalizedSearchQuery = initialCategory
            .toLowerCase()
            .replace(/-/g, " ");
          const filtered = response.data.filter((catalog: Catalog) => {
            const catalogNameNormalized = catalog.name.toLowerCase();
            const catalogCategoryNormalized = catalog.categorySlug
              .toLowerCase()
              .replace(/-/g, " ");
            // Cek apakah nama produk ATAU slug kategori mengandung query pencarian
            return (
              catalogNameNormalized.includes(normalizedSearchQuery) ||
              catalogCategoryNormalized.includes(normalizedSearchQuery)
            );
          });
          console.log(
            `[FilterableCatalog] Initial filtering after fetch found ${filtered.length} catalogs matching '${normalizedSearchQuery}'`
          );
          setFilteredCatalogs(filtered);
        } else {
          setFilteredCatalogs(response.data); // Tampilkan semua jika tidak ada initialCategory
        }
      } catch (error) {
        console.error("Error fetching catalog data:", error);
        setError("Gagal memuat katalog. Silakan coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogs();
  }, [initialCategory]); // Tetap gunakan initialCategory sebagai dependency

  // Handle filter changes (user typing in input - filters by category)
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setFilter(searchValue); // Update local state immediately for responsiveness

    // Update URL to reflect the search
    const currentParams = new URLSearchParams(window.location.search);
    if (searchValue) {
      currentParams.set("category", searchValue);
    } else {
      currentParams.delete("category");
    }

    // Use replace to avoid adding multiple history entries while typing
    router.replace(`${window.location.pathname}?${currentParams.toString()}`, {
      scroll: false,
    });

    // Apply filter locally
    const filtered = catalogs.filter((catalog) => {
      const catalogCategoryNormalized = catalog.categorySlug
        .toLowerCase()
        .replace(/-/g, " ");
      const searchValueNormalized = searchValue.toLowerCase();
      return catalogCategoryNormalized.includes(searchValueNormalized);
    });
    setFilteredCatalogs(filtered);
  };

  // Handle price range changes
  const handlePriceRangeChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setPriceRange(value);

      const filtered = catalogs.filter((catalog) =>
        catalog.sizes.some((size) => {
          const price = parseFloat(size.price.replace(/[^0-9.-]+/g, ""));
          return price >= value[0] && price <= value[1];
        })
      );
      setFilteredCatalogs(filtered);
    }
  };

  // Handle quantity filter
  const handleQuantityFilter = () => {
    setFilterByQuantity(!filterByQuantity);

    const filtered = filterByQuantity
      ? catalogs.filter((catalog) => parseInt(catalog.qty) > 0)
      : catalogs;
    setFilteredCatalogs(filtered);
  };

  // Navigate to product detail page
  const viewProductDetails = (
    catalogId: number,
    categorySlug: string,
    productSlug: string
  ) => {
    // Indicate loading specifically for this button
    setLoadingItems((prev) => ({ ...prev, [catalogId]: true }));
    // Set the global processing state to disable other buttons
    setProcessingItemId(catalogId);

    // Add a short delay before navigating to allow UI update
    setTimeout(() => {
      router.push(`/katalog/${categorySlug}/${productSlug}`);
      // No need to reset state here, navigation will handle unmount/remount
    }, 100); // 100ms delay, adjust if needed
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4 relative">
        {/* Filter Sidebar - Selalu di kiri dan fixed */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-4">
            <Card className="shadow-lg p-4 dark:bg-zinc-800">
              <h3 className="text-xl font-semibold mb-4">Filter Options</h3>
              <Input
                placeholder="Search by category..."
                value={filter}
                onChange={handleFilterChange}
                className="mb-4 w-full"
              />
              <div className="mb-4">
                <h4 className="text-lg font-medium mb-2">Price Range</h4>
                <div className="px-2">
                  <Slider
                    label="Select price range"
                    step={50000}
                    maxValue={10000000}
                    minValue={0}
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Rp {priceRange[0].toLocaleString("id-ID")}</span>
                    <span>Rp {priceRange[1].toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filterByQuantity}
                  onChange={handleQuantityFilter}
                  className="mr-2 w-4 h-4 rounded dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-zinc-800"
                />
                <label className="text-sm">Show only available products</label>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content Area - Konten selalu di kanan filter */}
        <div className="flex-1 min-h-screen">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="shadow-lg dark:bg-zinc-800">
                  <CardBody>
                    <div className="w-full aspect-square rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                    <div className="mt-4 space-y-3">
                      <Skeleton className="h-6 w-3/4 rounded-md dark:bg-gray-700" />
                      <Skeleton className="h-4 w-full rounded-md dark:bg-gray-700" />
                      <Skeleton className="h-4 w-1/2 rounded-md dark:bg-gray-700" />
                    </div>
                  </CardBody>
                  <CardFooter className="pt-0">
                    <Skeleton className="h-10 w-full rounded-md dark:bg-gray-700" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>{error}</p>
            </div>
          ) : filteredCatalogs.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No products match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalogs.map((catalog) => (
                <Card key={catalog.id} className="shadow-lg dark:bg-zinc-800">
                  <CardBody>
                    <div className="relative w-full aspect-square mb-4">
                      {catalog.image ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}${catalog.image}`}
                          alt={catalog.name || "Product Image"}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 capitalize truncate">
                      {catalog.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {catalog.description}
                    </p>
                  </CardBody>
                  <CardFooter>
                    <NextUIButton
                      color="primary"
                      className="w-full"
                      onPress={() =>
                        viewProductDetails(
                          catalog.id,
                          catalog.categorySlug,
                          catalog.productSlug
                        )
                      }
                      isDisabled={
                        loadingItems[catalog.id] ||
                        (processingItemId !== null &&
                          processingItemId !== catalog.id)
                      }
                      isLoading={loadingItems[catalog.id]}
                    >
                      View Details
                    </NextUIButton>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
