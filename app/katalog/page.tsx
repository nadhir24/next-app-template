"use client";

import React, { useEffect } from "react";
import FilterableCatalog from "@/components/FilterableCatalog";
import { useSearchParams } from "next/navigation";

export default function KatalogPage() {
  const searchParams = useSearchParams();
  // Baca parameter 'search' bukan 'category'
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    // Log query parameter pencarian jika ada
    if (searchQuery) {
      console.log("Pencarian awal:", searchQuery);
    }
  }, [searchQuery]);

  return (
    <div>
      {/* Kirim searchQuery sebagai initialCategory */}
      <FilterableCatalog initialCategory={searchQuery} />
    </div>
  );
}
