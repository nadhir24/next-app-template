"use client";
import { useEffect, useState } from "react";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { Button as NextUIButton } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Spacer } from "@nextui-org/spacer";
import { Slider } from "@nextui-org/slider";
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
  const router = useRouter();

  // Fetch catalog data from the API
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/catalog/");
        setCatalogs(response.data);
        setFilteredCatalogs(response.data); // Show all catalogs initially
      } catch (error) {
        console.error("Error fetching catalog data:", error);
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
    <div className="container mx-auto p-4 flex gap-4">
      {/* Filter Sidebar */}
      <div className="w-full md:w-1/4">
        <Card className="shadow-lg p-4 mb-8">
          <h3 className="text-xl font-semibold mb-4">Filter Options</h3>
          <Input
            placeholder="Search by name..."
            value={filter}
            onChange={handleFilterChange}
            className="mb-4"
          />
          <div className="mb-4">
            <h4 className="text-lg font-medium mb-2">Price Range</h4>
            <Slider
              label="Select price range"
              step={50000}
              maxValue={10000000}
              minValue={0}
              value={priceRange}
              onChange={handlePriceRangeChange}
              className="w-full"
              formatValue={(value) => `IDR ${value.toLocaleString()}`}
            />
          </div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={filterByQuantity}
              onChange={handleQuantityFilter}
              className="mr-2"
            />
            <label>Show only available products</label>
          </div>
        </Card>
      </div>

      {/* Catalog Items */}
      <div className="w-full md:w-3/4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCatalogs.map((catalog, index) => (
          <Card key={index} className="shadow-lg">
            <CardBody>
              <Image
                src={`http://localhost:5000/catalog/images/${catalog.image?.split("/").pop()}`}
                alt={catalog.name}
                width={256}
                height={270}
                quality={75}
                className="rounded-xl"
              />
              <div className="mt-4">
                <h4 className="font-bold text-lg">{catalog.name}</h4>
                <p className="text-black-600">{catalog.description}</p>
                <p>Starting from IDR {parseFloat(catalog.sizes[0]?.price || "0").toLocaleString()}</p>
                {parseInt(catalog.qty) === 0 && (
                  <p className="text-red-500 font-bold">Out of stock</p>
                )}
              </div>
            </CardBody>
            <CardFooter>
              <NextUIButton
                className="w-full"
                onPress={() => viewProductDetails(catalog.categorySlug, catalog.productSlug)}
                disabled={parseInt(catalog.qty) === 0}
              >
                View Details
              </NextUIButton>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}