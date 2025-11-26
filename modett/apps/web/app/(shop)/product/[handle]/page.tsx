"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { ProductImages } from "@/features/product-catalog/components/product-images";
import { ProductInfo } from "@/features/product-catalog/components/product-info";
import { WearItWith } from "@/features/product-catalog/components/wear-it-with";
import { YouMayAlsoLike } from "@/features/product-catalog/components/you-may-also-like";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  // Unwrap the params Promise using React.use()
  const { handle } = use(params);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", handle],
    queryFn: () => productService.getProductBySlug(handle),
  });

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-lg">Product not found</div>
      </div>
    );
  }

  return (
    <main className="w-full bg-[#EFECE5]">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Collection", href: "/collections" },
          { label: product.title },
        ]}
      />

      <section className="w-full">
        <div className="w-full max-w-[1440px] mx-auto pl-[80px] pr-[80px] pt-[64px] pb-[48px]">
          <div className="flex gap-[80px]">
            <ProductImages images={product.images || []} />

            <ProductInfo product={product} />
          </div>
        </div>
      </section>

      <WearItWith productId={product.id} />

      <YouMayAlsoLike productId={product.id} />
    </main>
  );
}
