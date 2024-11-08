import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { Button as NextUIButton } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Slider } from "@nextui-org/slider";
import Image from "next/image";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import axios from "axios";

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
  catalogs: Catalog[];
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const response = await axios.get("http://localhost:5000/catalog/");
    return { props: { catalogs: response.data } };
  } catch (error) {
    console.error("Error fetching catalog data:", error);
    return { props: { catalogs: [] } };
  }
};

export default function FilterableCatalog({ catalogs }: FilterableCatalogProps) {
  const [filter, setFilter] = useState("");
  const [budget, setBudget] = useState<number[]>([100, 300]); // Default budget range
  const [filteredCatalogs, setFilteredCatalogs] = useState<Catalog[]>(catalogs);
  const router = useRouter();

  // Memoized filter function to avoid unnecessary re-renders
  const filterCatalogs = useCallback(() => {
    const filtered = catalogs.filter((catalog) => {
      const isInNameFilter = catalog.name.toLowerCase().includes(filter);
      const isInBudgetFilter = catalog.sizes.some((size) => {
        const price = parseFloat(size.price.replace(/[^0-9.-]+/g, ""));
        return price >= budget[0] && price <= budget[1];
      });
      return isInNameFilter && isInBudgetFilter;
    });
    setFilteredCatalogs(filtered);
  }, [filter, budget, catalogs]);

  // Re-run filter when filter or budget changes
  useEffect(() => {
    filterCatalogs();
  }, [filter, budget, filterCatalogs]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value.toLowerCase());
  };

  const handleBudgetChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setBudget(value);
    }
  };

  const viewProductDetails = (categorySlug: string, productSlug: string) => {
    router.push(`/katalog/${categorySlug}/${productSlug}`);
  };

  return (
    <div className="container mx-auto p-4 flex gap-4">
      {/* Filter Sidebar */}
      <aside className="w-full md:w-1/4 mb-8">
        <Card className="shadow-lg p-4">
          <h3 className="text-xl font-semibold mb-4">Filter Options</h3>
          
          {/* Search by name */}
          <Input
            placeholder="Search by name..."
            value={filter}
            onChange={handleFilterChange}
            className="mb-4"
          />

          {/* Budget Filter */}
          <Slider
            label="Select a budget"
            formatOptions={{ style: "currency", currency: "USD" }}
            step={10}
            maxValue={1000}
            minValue={0}
            value={budget}
            onChange={handleBudgetChange}
            className="max-w-md"
          />
          <p className="text-default-500 font-medium text-small mt-2">
            Selected budget: ${budget[0]} – ${budget[1]}
          </p>
        </Card>
      </aside>

      {/* Catalog Items */}
      <section className="w-full md:w-3/4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCatalogs.map((catalog) => (
          <Card key={catalog.id} className="shadow-lg">
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
                onPress={() =>
                  viewProductDetails(catalog.categorySlug, catalog.productSlug)
                }
              >
                View Details
              </NextUIButton>
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
}
