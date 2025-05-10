"use client";

import React from "react";
import FilterableCatalog from "@/components/FilterableCatalog";
import { useSearchParams } from "next/navigation";

export default function KatalogPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search");

  return (
    <div>
      <FilterableCatalog initialCategory={searchQuery} />
    </div>
  );
}
