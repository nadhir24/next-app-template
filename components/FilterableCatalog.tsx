"use client";
import { useEffect, useState } from "react";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { Button as NextUIButton } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Spacer } from "@nextui-org/spacer";

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
          {/* Additional filter options can be added here if needed */}
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
                <p>Starting from {catalog.sizes[0]?.price || "N/A"}</p>
              </div>
            </CardBody>

            <CardFooter>
              <NextUIButton
                className="w-full"
                onPress={() => viewProductDetails(catalog.categorySlug, catalog.productSlug)}
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
