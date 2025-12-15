"use client";

import { Button } from "@/components/ui/button";
import { ProductCard } from "./product-card";
import { useFeaturedProducts } from "../queries";

export function InvestmentPieces() {
  const { data: products, isLoading, error } = useFeaturedProducts(6);

  if (error) {
    console.error("Error loading products:", error);
  }

  return (
    <section className="pt-[48px] pb-12 md:py-20 bg-[#EFECE5]">
      <div className="w-full px-[20px] md:px-[80px]">
        <div className="w-full max-w-[350px] md:max-w-[1280px] mx-auto flex flex-col gap-[32px] md:gap-[64px]">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0 md:h-[144px]">
            <div className="flex flex-col w-full md:max-w-3xl gap-3 md:gap-4">
              <div className="flex items-center w-fit h-fit">
                <p
                  className="text-[16px] md:text-sm leading-[24px] md:leading-6 font-medium md:font-normal tracking-[4px] md:tracking-wider uppercase"
                  style={{
                    color: "#765C4D",
                    fontFamily: "Raleway, sans-serif",
                  }}
                >
                  BEST SELLING
                </p>
              </div>
              <h2
                className="font-serif text-[32px] md:text-[48px] leading-[120%] md:leading-[60px] tracking-[0] md:tracking-[0.03em] uppercase w-full md:w-auto"
                style={{
                  fontWeight: 600,
                  color: "#232D35",
                }}
              >
                Investment Pieces
              </h2>
              <p
                className="text-[16px] md:text-[18px] leading-[20px] md:leading-[28px] tracking-[0.02em] w-full max-w-[330px] md:max-w-none text-left md:text-left md:mx-0"
                style={{
                  fontFamily: "Raleway, sans-serif",
                  fontWeight: 500,
                  color: "#232D35",
                }}
              >
                Born from subtle complexity. Crafted for the woman who values
                quiet confidence.
              </p>
            </div>
            <Button
              variant="outline"
              className="hidden md:inline-flex w-[150px] h-12 py-3 px-6 gap-2 border-[1.5px] border-[#232D35] bg-[#EFECE5] hover:bg-[#EFECE5] hover:border-[2.5px] transition-all"
            >
              <span className="w-[102px] h-6 text-[16px] leading-6 tracking-[4px] font-medium uppercase text-[#232D35]">
                VIEW ALL
              </span>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[64px]">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-gray-100 animate-pulse rounded"
                />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[49px]">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  productId={product.productId}
                  slug={product.slug}
                  title={product.title}
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  image={product.images?.[0]?.url || "/placeholder-product.jpg"}
                  variants={product.variants || []}
                  aspectRatio="aspect-[394/501.74]"
                  textGap="gap-[12.95px]"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No products available at the moment.
            </div>
          )}

          <div className="flex justify-start">
            <a
              href="#"
              className="flex items-center gap-[4px] md:gap-[8px] h-[24px] hover:opacity-70 transition-opacity"
              style={{ fontFamily: "Raleway" }}
            >
              <span
                className="h-[24px] text-[16px] leading-[24px] font-medium uppercase text-[#765C4D] whitespace-nowrap"
                style={{ letterSpacing: "4px" }}
              >
                SHOP ALL INVESTMENT PIECES
              </span>
              <span className="text-[16px] text-[#765C4D]">›</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
