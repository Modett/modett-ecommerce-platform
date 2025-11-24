"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/features/product-catalog/components/product-card";
import { productService } from "@/services/product.service";
import { ChevronDown, ChevronUp, ChevronLeft, Grid3X3, LayoutGrid } from "lucide-react";

const SIZES = ["34", "36", "38", "40", "42", "44", "46", "48", "50"];

export default function CollectionsPage() {
  const [showFilters, setShowFilters] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [gridView, setGridView] = useState<"3" | "4">("3");

  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [colourOpen, setColourOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ["collection-products"],
    queryFn: () => productService.getFeaturedProducts(12),
  });

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  return (
    <main className="min-h-screen bg-[#EFECE5]">
      <div className="w-full max-w-[1440px] mx-auto h-[24px] px-[80px] flex items-center">
        <nav
          className="text-[12px] text-[#765C4D] uppercase tracking-[2px]"
          style={{ fontFamily: "Raleway" }}
        >
          <Link href="/" className="hover:text-[#232D35] transition-colors">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#232D35]">COLLECTION</span>
        </nav>
      </div>

      <div className="w-full max-w-[768px] mx-auto h-[42px] flex flex-col items-center justify-center gap-[16px] bg-[#EFECE5]">
        <h1
          className="w-[150px] h-[42px] text-[24px] text-[#765C4D] font-semibold leading-[130%] tracking-[0%]"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Collection
        </h1>
      </div>

      <div className="w-full max-w-[1440px] mx-auto pt-[16px] px-[80px] pb-[32px] flex flex-col gap-[80px] bg-[#EFECE5]">
        <div className="w-full max-w-[1280px] mx-auto h-[41px] flex items-center justify-between border-b border-[#E5E0D6]">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex flex-col items-start"
          >
            {/* First row: HIDE + chevron */}
            <div className="flex items-center gap-[16px]">
              <span
                className="text-[14px] font-medium uppercase leading-[24px] text-[#6B7B8A]"
                style={{ fontFamily: "Reddit Sans, sans-serif", letterSpacing: "3px" }}
              >
                {showFilters ? "HIDE" : "SHOW"}
              </span>
              <ChevronLeft
                className={`w-4 h-4 text-[#6B7B8A] transition-transform ${showFilters ? "" : "rotate-180"}`}
              />
            </div>
            {/* Second row: FILTERS */}
            <span
              className="text-[14px] font-medium uppercase leading-[24px] text-[#6B7B8A]"
              style={{ fontFamily: "Reddit Sans, sans-serif", letterSpacing: "3px" }}
            >
              FILTERS
            </span>
          </button>

          <div className="flex items-center gap-[19px] h-[33px]">
            <div className="flex items-center gap-2 h-[33px]">
              <span
                className="text-[14px] font-medium uppercase leading-[24px] text-[#6B7B8A] whitespace-nowrap"
                style={{ fontFamily: "Reddit Sans, sans-serif", letterSpacing: "3px" }}
              >
                SORT BY:
              </span>
              <select
                className="w-[120px] h-[33px] text-[14px] font-medium text-[#6B7B8A] bg-transparent border-none outline-none cursor-pointer"
                style={{ fontFamily: "Reddit Sans, sans-serif", letterSpacing: "3px" }}
              >
                <option value="newest">Select...</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span
                className="text-[12px] text-[#765C4D] uppercase tracking-[2px] mr-2"
                style={{ fontFamily: "Raleway" }}
              >
                GRID
              </span>
              <button
                onClick={() => setGridView("3")}
                className={`p-1 ${gridView === "3" ? "text-[#232D35]" : "text-[#765C4D]"}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setGridView("4")}
                className={`p-1 ${gridView === "4" ? "text-[#232D35]" : "text-[#765C4D]"}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[1280px] mx-auto flex gap-[80px]">
          {showFilters && (
            <aside className="w-[200px] flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-[12px] text-[#765C4D] uppercase tracking-[2px]"
                  style={{ fontFamily: "Raleway" }}
                >
                  FILTER BY
                </span>
                <button
                  className="text-[10px] text-[#765C4D] underline"
                  style={{ fontFamily: "Raleway" }}
                >
                  Clear Filters
                </button>
              </div>

              <div className="border-t border-[#D4C4A8] py-3">
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="flex items-center justify-between w-full"
                >
                  <span
                    className="text-[12px] text-[#765C4D] uppercase tracking-[2px]"
                    style={{ fontFamily: "Raleway" }}
                  >
                    CATEGORIES
                  </span>
                  {categoriesOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#765C4D]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#765C4D]" />
                  )}
                </button>
                {categoriesOpen && (
                  <div className="mt-3 space-y-2">
                    <label
                      className="flex items-center gap-2 text-[12px] text-[#765C4D]"
                      style={{ fontFamily: "Raleway" }}
                    >
                      <input type="checkbox" className="accent-[#765C4D]" />
                      Dresses
                    </label>
                    <label
                      className="flex items-center gap-2 text-[12px] text-[#765C4D]"
                      style={{ fontFamily: "Raleway" }}
                    >
                      <input type="checkbox" className="accent-[#765C4D]" />
                      Tops
                    </label>
                    <label
                      className="flex items-center gap-2 text-[12px] text-[#765C4D]"
                      style={{ fontFamily: "Raleway" }}
                    >
                      <input type="checkbox" className="accent-[#765C4D]" />
                      Bottoms
                    </label>
                  </div>
                )}
              </div>

              <div className="border-t border-[#D4C4A8] py-3">
                <button
                  onClick={() => setColourOpen(!colourOpen)}
                  className="flex items-center justify-between w-full"
                >
                  <span
                    className="text-[12px] text-[#765C4D] uppercase tracking-[2px]"
                    style={{ fontFamily: "Raleway" }}
                  >
                    COLOUR
                  </span>
                  {colourOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#765C4D]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#765C4D]" />
                  )}
                </button>
              </div>

              <div className="border-t border-[#D4C4A8] py-3">
                <button
                  onClick={() => setCollectionOpen(!collectionOpen)}
                  className="flex items-center justify-between w-full"
                >
                  <span
                    className="text-[12px] text-[#765C4D] uppercase tracking-[2px]"
                    style={{ fontFamily: "Raleway" }}
                  >
                    COLLECTION
                  </span>
                  {collectionOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#765C4D]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#765C4D]" />
                  )}
                </button>
              </div>

              <div className="border-t border-[#D4C4A8] py-3">
                <span
                  className="text-[12px] text-[#765C4D] uppercase tracking-[2px] block mb-3"
                  style={{ fontFamily: "Raleway" }}
                >
                  SIZE
                </span>
                <div className="space-y-2">
                  {SIZES.map((size) => (
                    <label
                      key={size}
                      className="flex items-center gap-2 text-[12px] text-[#765C4D] cursor-pointer"
                      style={{ fontFamily: "Raleway" }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                        className="w-4 h-4 accent-[#765C4D]"
                      />
                      {size} ({Math.floor(Math.random() * 100)})
                    </label>
                  ))}
                </div>
              </div>
            </aside>
          )}

          <div className="flex-1">
            {isLoading ? (
              <div
                className={`grid gap-6 ${gridView === "3" ? "grid-cols-3" : "grid-cols-4"}`}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-[500px] w-full" />
                    <div className="mt-4 space-y-2">
                      <div className="bg-gray-200 h-4 w-3/4" />
                      <div className="bg-gray-200 h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`grid gap-6 ${gridView === "3" ? "grid-cols-3" : "grid-cols-4"}`}
              >
                {products?.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    compareAtPrice={product.compareAtPrice}
                    image={
                      product.images?.[0]?.url || "/placeholder-product.jpg"
                    }
                    variants={product.variants || []}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
