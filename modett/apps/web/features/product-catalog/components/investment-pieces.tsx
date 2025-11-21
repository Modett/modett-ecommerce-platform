"use client";

import { Button } from "@/components/ui/button";
import { ProductCard } from "./product-card";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";

export function InvestmentPieces() {
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productService.getFeaturedProducts(6),
  });

  if (error) {
    console.error("Error loading products:", error);
  }

  return (
    <section className="py-20 bg-[#EFECE5]">
      <div className="w-full max-w-[1440px] mx-auto px-8">
        <div className="w-full max-w-[1280px] mx-auto flex flex-col gap-[80px]">
          <div className="flex justify-between items-center h-[144px]">
            <div className="flex flex-col w-full max-w-3xl gap-4">
              <div className="flex flex-col w-full h-[104px] gap-4">
                <div className="flex items-center w-[154px] h-6">
                  <p className="text-sm uppercase tracking-wider text-muted-foreground">
                    BEST SELLING
                  </p>
                </div>
                <h2 className="font-serif text-[48px] leading-[60px] tracking-[0.03em] font-medium uppercase w-full h-[60px]">
                  INVESTMENT PIECES
                </h2>
                <p className="text-[18px] leading-[28px] font-normal text-[#232D35] w-full h-[28px]">
                  Born from subtle complexity. Crafted for the woman who values
                  quiet confidence.
                </p>
              </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[48px]">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-gray-100 animate-pulse rounded"
                />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[48px]">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  image={product.images?.[0]?.url || "/placeholder-product.jpg"}
                  variants={product.variants || []}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No products available at the moment.
            </div>
          )}

          <div className="text-center">
            <Button variant="link" className="text-sm uppercase tracking-wider">
              SHOP ALL INVESTMENT PIECES
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
