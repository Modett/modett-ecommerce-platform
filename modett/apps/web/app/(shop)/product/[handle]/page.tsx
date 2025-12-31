"use client";

import { use } from "react";
import Link from "next/link";
import { useProductBySlug } from "@/features/product-catalog/queries";
import { ProductImages } from "@/features/product-catalog/components/product-images";
import { ProductInfo } from "@/features/product-catalog/components/product-info";
import { WearItWith } from "@/features/product-catalog/components/wear-it-with";
import { YouMayAlsoLike } from "@/features/product-catalog/components/you-may-also-like";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { COMMON_CLASSES, RESPONSIVE } from "@/features/cart/constants/styles";
import { ViewMoreSection } from "@/features/product-catalog/components/view-more-section";
import { ProductDetailSkeleton } from "@/components/ui/skeleton";

interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  // Unwrap the params Promise using React.use()
  const { handle } = use(params);

  const { data: product, isLoading } = useProductBySlug(handle);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-lg">Product not found</div>
      </div>
    );
  }

  return (
    <main className={`w-full ${COMMON_CLASSES.pageBg}`}>
      {/* Breadcrumb Navigation */}
      <div className="hidden md:block">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Collection", href: "/collections" },
            { label: product.title },
          ]}
        />
      </div>

      <section className="w-full">
        <div
          className={`w-full max-w-[1280px] mx-auto ${RESPONSIVE.padding.page} pt-12 md:pt-16 lg:pt-[64px] pb-0 md:pb-10 lg:pb-[48px]`}
        >
          <div className="flex flex-col lg:flex-row gap-[40px]">
            <ProductImages images={product.images || []} />

            <ProductInfo product={product} />
          </div>
        </div>
      </section>

      <WearItWith productId={product.id} />

      <YouMayAlsoLike productId={product.id} />

      <ViewMoreSection />
    </main>
  );
}
