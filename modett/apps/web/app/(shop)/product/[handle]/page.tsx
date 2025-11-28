"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { ProductImages } from "@/features/product-catalog/components/product-images";
import { ProductInfo } from "@/features/product-catalog/components/product-info";
import { WearItWith } from "@/features/product-catalog/components/wear-it-with";
import { YouMayAlsoLike } from "@/features/product-catalog/components/you-may-also-like";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { COMMON_CLASSES, RESPONSIVE } from "@/features/cart/constants/styles";

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
    <main className={`w-full ${COMMON_CLASSES.pageBg}`}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Collection", href: "/collections" },
          { label: product.title },
        ]}
      />

      <section className="w-full">
        <div className={`w-full max-w-[1440px] mx-auto ${RESPONSIVE.padding.page} pt-12 md:pt-16 lg:pt-[64px] pb-8 md:pb-10 lg:pb-[48px]`}>
          <div className="flex flex-col lg:flex-row gap-12 md:gap-16 lg:gap-20 xl:gap-[80px]">
            <ProductImages images={product.images || []} />

            <ProductInfo product={product} />
          </div>
        </div>
      </section>

      <WearItWith productId={product.id} />

      <YouMayAlsoLike productId={product.id} />

      {/* View More Button Section */}
      <section className={`w-full ${COMMON_CLASSES.pageBg}`}>
        <div className={`w-full max-w-[1280px] mx-auto flex flex-col items-center justify-center ${RESPONSIVE.gap.item} pt-6 md:pt-8 lg:pt-[32px] pb-4 md:pb-6 lg:pb-8`}>
          <Link href="/collections">
            <button className={`w-full min-w-[180px] md:min-w-[190px] lg:min-w-[200px] max-w-[200px] h-[44px] md:h-[46px] lg:h-[48px] px-5 md:px-6 py-2.5 md:py-3 ${COMMON_CLASSES.primaryButton}`}>
              <span className="text-[13px] md:text-[13.5px] lg:text-[14px] font-medium leading-[22px] md:leading-[23px] lg:leading-[24px] uppercase text-white whitespace-nowrap">
                VIEW MORE
              </span>
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
