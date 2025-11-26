"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { ProductCard } from "./product-card";

interface WearItWithProps {
  productId: string;
}

export function WearItWith({ productId }: WearItWithProps) {
  const { data: products, isLoading } = useQuery({
    queryKey: ["wear-it-with", productId],
    queryFn: () => productService.getFeaturedProducts(3),
  });

  if (isLoading || !products || products.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#EFECE5] py-[32px]">
      <div className="w-full max-w-[1440px] mx-auto px-[80px]">
        <div className="flex flex-col gap-[32px]">
          {/* Section Title */}
          <h2
            className="text-[24px] leading-[32px] font-normal"
            style={{ fontFamily: "Playfair Display, serif", color: "#232D35" }}
          >
            Wear it with
          </h2>

          {/* Product Grid - 3 columns */}
          <div className="grid grid-cols-3 gap-[32px]">
            {products.slice(0, 3).map((product) => (
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
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
