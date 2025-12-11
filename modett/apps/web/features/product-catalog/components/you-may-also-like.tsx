"use client";

import { useFeaturedProducts } from "../queries";
import { ProductCard } from "./product-card";

interface YouMayAlsoLikeProps {
  productId: string;
}

export function YouMayAlsoLike({ productId }: YouMayAlsoLikeProps) {
  const { data: products, isLoading } = useFeaturedProducts(6);

  if (isLoading || !products || products.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#EFECE5] pt-[24px] md:pt-[32px] pb-[32px]">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[80px]">
        <div className="flex flex-col gap-[32px]">
          {/* Section Title */}
          <h2
            className="flex items-center justify-center md:block w-full h-[59px] md:h-auto text-[24px] font-normal text-center md:text-left"
            style={{
              fontFamily: "Raleway, sans-serif",
              color: "#765C4D",
              lineHeight: "140%",
              letterSpacing: "0%",
            }}
          >
            You may also like
          </h2>

          {/* Product Grid - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[32px]">
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
                variant="wear-it-with"
                aspectRatio="aspect-[350/502]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
