"use client";
import { useEffect, useState } from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Button as NextUIButton } from "@heroui/button";
import { Input } from "@heroui/input";
import { Slider } from "@heroui/slider";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

export default function FilterableCatalog() {
  const [filter, setFilter] = useState("");
  const [filterByQuantity, setFilterByQuantity] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000000]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [filteredCatalogs, setFilteredCatalogs] = useState<Catalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch catalog data from the API
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get("http://localhost:5000/catalog/");
        setCatalogs(response.data);
        setFilteredCatalogs(response.data);
      } catch (error) {
        console.error("Error fetching catalog data:", error);
        setError("Gagal memuat katalog. Silakan coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogs();
  }, []);

  // Handle filter changes
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setFilter(searchValue);

    const filtered = catalogs.filter((catalog) =>
      catalog.name.toLowerCase().includes(searchValue)
    );
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
  const viewProductDetails = (categorySlug: string, productSlug: string) => {
    router.push(`/katalog/${categorySlug}/${productSlug}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4 relative">
        {/* Filter Sidebar - Selalu di kiri dan fixed */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-4">
            <Card className="shadow-lg p-4">
              <h3 className="text-xl font-semibold mb-4">Filter Options</h3>
              <Input
                placeholder="Search by name..."
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
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
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
                  className="mr-2 w-4 h-4"
                />
                <label className="text-sm">Show only available products</label>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content Area - Konten selalu di kanan filter */}
        <div className="flex-1 min-h-screen">
          {isLoading ? (
            <div className="w-full h-[calc(100vh-8rem)] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="w-full p-4 text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalogs.map((catalog, index) => (
                <Card key={index} className="shadow-lg">
                  <CardBody>
                    <div className="relative w-full aspect-square">
                      <Image
                        src={`http://localhost:5000/catalog/images/${catalog.image
                          ?.split("/")
                          .pop()}`}
                        alt={catalog.name}
                        fill
                        className="rounded-xl object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="mt-4">
                      <h4 className="font-bold text-lg">{catalog.name}</h4>
                      <p className="text-gray-600 line-clamp-2">
                        {catalog.description}
                      </p>
                      <p className="mt-2 font-medium">
                        Starting from Rp{" "}
                        {catalog.sizes.length > 0
                          ? parseFloat(
                              catalog.sizes[0].price.replace(/[^0-9.-]+/g, "")
                            ).toLocaleString("id-ID")
                          : "0"}
                      </p>
                      {parseInt(catalog.qty) === 0 && (
                        <p className="text-red-500 font-bold mt-1">
                          Out of stock
                        </p>
                      )}
                    </div>
                  </CardBody>
                  <CardFooter>
                    <NextUIButton
                      className="w-full"
                      onPress={() =>
                        viewProductDetails(
                          catalog.categorySlug,
                          catalog.productSlug
                        )
                      }
                      disabled={parseInt(catalog.qty) === 0}
                      isLoading={isLoading}
                      spinner={
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      }
                    >
                      {isLoading ? "Loading..." : "View Details"}
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
