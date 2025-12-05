"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/features/product-catalog/components/product-card";
import {
  useProducts,
  useCategories,
  useSizeCounts,
  useColorCounts,
} from "@/features/product-catalog/queries";
import { getColorHex } from "@/lib/colors";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Grid3X3,
  LayoutGrid,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Text } from "@/components/ui/text";
import {
  TEXT_STYLES,
  COMMON_CLASSES,
  COLORS,
  FONTS,
  RESPONSIVE,
} from "@/features/cart/constants/styles";

export default function CollectionsPage() {
  const [showFilters, setShowFilters] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [gridView, setGridView] = useState<"2" | "3">("3");

  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [colourOpen, setColourOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(true);
  const [filterKey, setFilterKey] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [displayCount, setDisplayCount] = useState(12);
  const pageSize = 12;

  const { data: productsData, isLoading } = useProducts({
    sort: sortBy,
    pageSize: 100,
  });

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + pageSize);
  };

  const filteredProducts =
    productsData?.products?.filter((product) => {
      if (selectedCategories.length > 0) {
        const hasSelectedCategory = product.categories?.some((cat) =>
          selectedCategories.includes(cat.id)
        );
        if (!hasSelectedCategory) return false;
      }

      if (selectedCollections.length > 0) {
        const hasSelectedCollection = product.categories?.some((cat) =>
          selectedCollections.includes(cat.id)
        );
        if (!hasSelectedCollection) return false;
      }

      if (selectedSizes.length > 0) {
        const hasSelectedSize = product.variants?.some(
          (variant) =>
            variant.size &&
            selectedSizes.includes(variant.size) &&
            variant.inventory > 0
        );
        if (!hasSelectedSize) return false;
      }

      if (selectedColors.length > 0) {
        const hasSelectedColor = product.variants?.some(
          (variant) =>
            variant.color &&
            selectedColors.includes(variant.color) &&
            variant.inventory > 0
        );
        if (!hasSelectedColor) return false;
      }

      return true;
    }) || [];

  const displayedProducts = filteredProducts.slice(0, displayCount) || [];
  const startItem = 1;
  const endItem = Math.min(displayCount, filteredProducts.length);
  const totalItems = filteredProducts.length;
  const hasMore = displayCount < totalItems;

  const { data: allCategories } = useCategories();

  const productTypeCategories =
    allCategories?.filter(
      (cat: any) => ((cat.position as number) || 0) < 100
    ) || [];
  const collectionCategories =
    allCategories?.filter(
      (cat: any) => ((cat.position as number) || 0) >= 100
    ) || [];

  const { data: sizeCounts = [] } = useSizeCounts();

  const { data: colorCounts = [] } = useColorCounts();

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleCollection = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((c) => c !== collectionId)
        : [...prev, collectionId]
    );
  };

  const handleClearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedCategories([]);
    setSelectedCollections([]);
    setFilterKey((prev) => prev + 1);
  };

  return (
    <main className={`min-h-screen ${COMMON_CLASSES.pageBg}`}>
      <Breadcrumb
        items={[{ label: "HOME", href: "/" }, { label: "COLLECTION" }]}
      />

      <div
        className={`w-full max-w-[768px] mx-auto h-[42px] flex flex-col items-center justify-center gap-[16px] ${COMMON_CLASSES.pageBg}`}
      >
        <Text.Accent className="w-full max-w-[150px] h-[42px] text-[24px] font-semibold leading-[130%] tracking-[0%]">
          Collection
        </Text.Accent>
      </div>

      <div
        className={`w-full max-w-[1440px] mx-auto pt-[16px] ${RESPONSIVE.padding.page} pb-[32px] flex flex-col gap-[80px] ${COMMON_CLASSES.pageBg}`}
      >
        <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-[18px]">
          <div
            className="w-full h-[41px] flex items-center justify-between border-b"
            style={{ borderColor: COLORS.alabaster }}
          >
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex flex-col items-start"
            >
              {/* First row: HIDE + chevron */}
              <div className="flex items-center gap-[16px]">
                <Text.Secondary className="text-[14px] font-medium uppercase leading-[24px] tracking-[3px]">
                  {showFilters ? "HIDE" : "SHOW"}
                </Text.Secondary>
                <ChevronLeft
                  className="w-4 h-4 transition-transform"
                  style={{
                    color: COLORS.slateGray,
                    transform: showFilters ? "" : "rotate(180deg)",
                  }}
                />
              </div>
              {/* Second row: FILTERS */}
              <Text.Secondary className="text-[14px] font-medium uppercase leading-[24px] tracking-[3px]">
                FILTERS
              </Text.Secondary>
            </button>

            <div className="flex items-center gap-[19px] h-[33px]">
              <div className="flex items-center gap-2 h-[33px]">
                <Text.Secondary className="text-[14px] font-medium uppercase leading-[24px] tracking-[3px] whitespace-nowrap">
                  SORT BY:
                </Text.Secondary>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full max-w-[180px] h-[33px] text-[14px] font-medium ${COMMON_CLASSES.pageBg} border-none outline-none cursor-pointer uppercase pr-2 tracking-[3px]`}
                  style={{ ...TEXT_STYLES.secondary }}
                >
                  <option
                    value="newest"
                    style={{
                      backgroundColor: COLORS.linen,
                      color: COLORS.graphite,
                      padding: "8px 12px",
                      fontFamily: FONTS.reddit,
                      letterSpacing: "3px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Select...
                  </option>
                  <option
                    value="newest"
                    style={{
                      backgroundColor: COLORS.linen,
                      color: COLORS.graphite,
                      padding: "8px 12px",
                      fontFamily: FONTS.reddit,
                      letterSpacing: "3px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Newest
                  </option>
                  <option
                    value="price_asc"
                    style={{
                      backgroundColor: COLORS.linen,
                      color: COLORS.graphite,
                      padding: "8px 12px",
                      fontFamily: FONTS.reddit,
                      letterSpacing: "3px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Price: Low to High
                  </option>
                  <option
                    value="price_desc"
                    style={{
                      backgroundColor: COLORS.linen,
                      color: COLORS.graphite,
                      padding: "8px 12px",
                      fontFamily: FONTS.reddit,
                      letterSpacing: "3px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Price: High to Low
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span
                  className="text-[14px] font-medium uppercase tracking-[3px] flex items-center"
                  style={{
                    fontFamily: FONTS.reddit,
                    lineHeight: "14px",
                    color: COLORS.tealBlue,
                  }}
                >
                  GRID
                </span>
                <button
                  onClick={() => setGridView("3")}
                  style={{
                    color: gridView === "3" ? COLORS.graphite : COLORS.tealBlue,
                  }}
                >
                  <Grid3X3 className="w-[20px] h-[20px]" />
                </button>
                <button
                  onClick={() => setGridView("2")}
                  style={{
                    color: gridView === "2" ? COLORS.graphite : COLORS.tealBlue,
                  }}
                >
                  <LayoutGrid className="w-[20px] h-[20px]" />
                </button>
              </div>
            </div>
          </div>

          {/* Selected Filters Bar */}
          {(selectedSizes.length > 0 ||
            selectedColors.length > 0 ||
            selectedCategories.length > 0 ||
            selectedCollections.length > 0) && (
            <div
              className="w-full max-w-[1280px] mx-auto min-h-[56px] flex items-center gap-[18px] border-b pb-[18px] flex-wrap"
              style={{ borderColor: COLORS.alabaster }}
            >
              {selectedCategories.map((categoryId) => {
                const category = productTypeCategories.find(
                  (c) => c.id === categoryId
                );
                return category ? (
                  <button
                    key={categoryId}
                    onClick={() => toggleCategory(categoryId)}
                    className="h-[32px] px-[10px] py-[4px] flex items-center gap-[21px] transition-colors"
                    style={{
                      backgroundColor: COLORS.tealBlue,
                      fontFamily: FONTS.raleway,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        COLORS.buttonHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = COLORS.tealBlue)
                    }
                  >
                    <span className="text-[12px] font-medium text-white uppercase tracking-[1px] whitespace-nowrap">
                      {category.name}
                    </span>
                    <span className="text-[16px] text-white">×</span>
                  </button>
                ) : null;
              })}
              {selectedCollections.map((collectionId) => {
                const collection = collectionCategories.find(
                  (c) => c.id === collectionId
                );
                return collection ? (
                  <button
                    key={collectionId}
                    onClick={() => toggleCollection(collectionId)}
                    className="h-[32px] px-[10px] py-[4px] flex items-center gap-[21px] transition-colors"
                    style={{
                      backgroundColor: COLORS.tealBlue,
                      fontFamily: FONTS.raleway,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        COLORS.buttonHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = COLORS.tealBlue)
                    }
                  >
                    <span className="text-[12px] font-medium text-white uppercase tracking-[1px] whitespace-nowrap">
                      {collection.name}
                    </span>
                    <span className="text-[16px] text-white">×</span>
                  </button>
                ) : null;
              })}
              {selectedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className="h-[32px] px-[10px] py-[4px] flex items-center gap-[21px] transition-colors"
                  style={{
                    backgroundColor: COLORS.tealBlue,
                    fontFamily: FONTS.raleway,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = COLORS.buttonHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = COLORS.tealBlue)
                  }
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{
                        backgroundColor: getColorHex(color),
                        borderColor: COLORS.white,
                        borderWidth: "1px",
                      }}
                    />
                    <span className="text-[12px] font-medium text-white uppercase tracking-[1px] whitespace-nowrap">
                      {color}
                    </span>
                  </div>
                  <span className="text-[16px] text-white">×</span>
                </button>
              ))}
              {selectedSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className="w-full max-w-[120px] h-[32px] pt-[4px] pr-[9px] pb-[4px] pl-[10px] flex items-center gap-[21px] transition-colors"
                  style={{
                    backgroundColor: COLORS.tealBlue,
                    fontFamily: FONTS.raleway,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = COLORS.buttonHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = COLORS.tealBlue)
                  }
                >
                  <span className="text-[12px] font-medium text-white uppercase tracking-[1px] whitespace-nowrap">
                    SIZE:{size}
                  </span>
                  <span className="text-[16px] text-white">×</span>
                </button>
              ))}
            </div>
          )}

          <div className="w-full max-w-[1280px] mx-auto flex gap-[18px]">
            {showFilters && (
              <aside
                className="w-full max-w-[250px] flex-shrink-0"
                key={filterKey}
              >
                <div className="flex items-center justify-between mb-4">
                  <Text.Accent className="text-[12px] uppercase tracking-[2px]">
                    FILTER BY
                  </Text.Accent>
                  <button
                    onClick={handleClearFilters}
                    className={`w-full max-w-[89px] h-[24px] pt-[4px] pr-[9px] pb-[4px] pl-[10px] text-[12px] flex items-center justify-center hover:${COMMON_CLASSES.cartItemBg} transition-colors rounded whitespace-nowrap`}
                    style={TEXT_STYLES.accent}
                  >
                    Clear Filters
                  </button>
                </div>

                <div
                  className={`border-t ${COMMON_CLASSES.borderPrimary} py-3`}
                >
                  <button
                    onClick={() => setCategoriesOpen(!categoriesOpen)}
                    className="flex items-center justify-between w-full"
                  >
                    <Text.Accent className="text-[12px] uppercase tracking-[2px]">
                      CATEGORIES
                    </Text.Accent>
                    {categoriesOpen ? (
                      <ChevronUp
                        className="w-4 h-4"
                        style={{ color: COLORS.richUmber }}
                      />
                    ) : (
                      <ChevronDown
                        className="w-4 h-4"
                        style={{ color: COLORS.richUmber }}
                      />
                    )}
                  </button>
                  {categoriesOpen && (
                    <div className="mt-3 space-y-2">
                      {productTypeCategories?.map((category: any) => (
                        <label
                          key={category.id}
                          className="flex items-center gap-2 text-[12px] cursor-pointer"
                          style={TEXT_STYLES.accent}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => toggleCategory(category.id)}
                            className="w-4 h-4"
                            style={{ accentColor: COLORS.tealBlue }}
                          />
                          {category.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={`border-t ${COMMON_CLASSES.borderPrimary} py-3`}
                >
                  <button
                    onClick={() => setColourOpen(!colourOpen)}
                    className="flex items-center justify-between w-full"
                  >
                    <Text.Accent className="text-[12px] uppercase tracking-[2px]">
                      COLOUR
                    </Text.Accent>
                    {colourOpen ? (
                      <ChevronUp
                        className="w-4 h-4"
                        style={{ color: COLORS.richUmber }}
                      />
                    ) : (
                      <ChevronDown
                        className="w-4 h-4"
                        style={{ color: COLORS.richUmber }}
                      />
                    )}
                  </button>
                  {colourOpen && (
                    <div className="mt-3 space-y-2">
                      {colorCounts.map(
                        (item: { id: string; count: number }) => (
                          <label
                            key={item.id}
                            className="flex items-center gap-2 text-[12px] cursor-pointer"
                            style={TEXT_STYLES.accent}
                          >
                            <input
                              type="checkbox"
                              checked={selectedColors.includes(item.id)}
                              onChange={() => toggleColor(item.id)}
                              className="w-4 h-4"
                              style={{ accentColor: COLORS.tealBlue }}
                            />
                            <div
                              className="w-3 h-3 rounded-full border flex-shrink-0"
                              style={{
                                backgroundColor: getColorHex(item.id),
                                borderColor: COLORS.richUmber,
                                borderWidth: "1px",
                              }}
                            />
                            <span className="capitalize">
                              {item.id} ({item.count})
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  )}
                </div>

                <div
                  className={`border-t ${COMMON_CLASSES.borderPrimary} py-3`}
                >
                  <button
                    onClick={() => setCollectionOpen(!collectionOpen)}
                    className="flex items-center justify-between w-full"
                  >
                    <Text.Accent className="text-[12px] uppercase tracking-[2px]">
                      COLLECTION
                    </Text.Accent>
                    {collectionOpen ? (
                      <ChevronUp
                        className="w-4 h-4"
                        style={{ color: COLORS.richUmber }}
                      />
                    ) : (
                      <ChevronDown
                        className="w-4 h-4"
                        style={{ color: COLORS.richUmber }}
                      />
                    )}
                  </button>
                  {collectionOpen && (
                    <div className="mt-3 space-y-2">
                      {collectionCategories?.map((category: any) => (
                        <label
                          key={category.id}
                          className="flex items-center gap-2 text-[12px] cursor-pointer"
                          style={TEXT_STYLES.accent}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCollections.includes(category.id)}
                            onChange={() => toggleCollection(category.id)}
                            className="w-4 h-4"
                            style={{ accentColor: COLORS.tealBlue }}
                          />
                          {category.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={`border-t ${COMMON_CLASSES.borderPrimary} py-3`}
                >
                  <button
                    onClick={() => setSizeOpen(!sizeOpen)}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <Text.Accent className="text-[12px] uppercase tracking-[2px]">
                      SIZE
                    </Text.Accent>
                    {sizeOpen ? (
                      <ChevronUp
                        className="w-4 h-4"
                        style={{ color: COLORS.richUmber }}
                      />
                    ) : (
                      <ChevronDown
                        className="w-4 h-4"
                        style={{ color: COLORS.richUmber }}
                      />
                    )}
                  </button>
                  {sizeOpen && (
                    <div className="space-y-2">
                      {sizeCounts.map((item: { id: string; count: number }) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-2 text-[12px] cursor-pointer"
                          style={TEXT_STYLES.accent}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSizes.includes(item.id)}
                            onChange={() => toggleSize(item.id)}
                            className="w-4 h-4"
                            style={{ accentColor: COLORS.tealBlue }}
                          />
                          {item.id} ({item.count})
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            )}

            <div
              className={`flex-1 grid ${
                gridView === "3"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-2"
              }`}
              style={{
                gap: showFilters ? "20px" : "48px",
              }}
            >
              {isLoading ? (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-[420px] w-full" />
                      <div className="mt-4 space-y-2">
                        <div className="bg-gray-200 h-4 w-3/4" />
                        <div className="bg-gray-200 h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      productId={product.productId}
                      slug={product.slug}
                      title={product.title}
                      price={product.price}
                      compareAtPrice={product.compareAtPrice}
                      image={
                        product.images?.[0]?.url || "/placeholder-product.jpg"
                      }
                      variants={product.variants || []}
                      variant="collection"
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Pagination Section */}
          {!isLoading && productsData && productsData.products.length > 0 && (
            <div className="w-full max-w-[1280px] h-[143px] mx-auto flex flex-col items-center justify-center gap-[24px] pt-[32px]">
              <Text.Secondary className="text-[14px] font-medium leading-[24px] tracking-[3px] uppercase">
                {startItem}-{endItem} of {totalItems} items
              </Text.Secondary>
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  className={`w-full max-w-[200px] h-[48px] px-6 py-3 ${COMMON_CLASSES.primaryButton}`}
                >
                  <span
                    className="text-[14px] font-medium leading-[24px] tracking-[3px] uppercase text-white whitespace-nowrap"
                    style={{ fontFamily: FONTS.reddit }}
                  >
                    VIEW {pageSize} MORE
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
