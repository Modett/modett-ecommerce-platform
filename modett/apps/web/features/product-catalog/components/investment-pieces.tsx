"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "./product-card";
import { useCart, useWishlist } from "@/contexts";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  handle: string;
  rating?: number;
  totalReviews?: number;
  sizes?: string[];
  sizeToVariantId?: Record<string, string>;
  defaultVariantId?: string;
}

interface InvestmentPiecesProps {
  title?: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
}

export function InvestmentPieces({
  title = "INVESTMENT PIECES",
  subtitle = "Born from subtle complexity. Crafted for the woman who values quiet confidence.",
  products,
  viewAllHref = "/catalog",
}: InvestmentPiecesProps) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [notification, setNotification] = useState<string | null>(null);

  const handleAddToCart = async (productId: string, size: string) => {
    // Find the product to get its variant mapping
    const product = products.find((p) => p.id === productId);
    if (!product) {
      setNotification("Product not found");
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Get the variant ID for the selected size
    const variantId = product.sizeToVariantId?.[size];
    if (!variantId) {
      setNotification(`Size ${size} is not available`);
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Add item to cart
    const result = await addItem({
      variantId,
      qty: 1,
    });

    // Show notification based on result
    if (result?.success) {
      setNotification("Added to cart!");
    } else {
      setNotification(result?.message || "Unable to add to cart");
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleWishlist = async (variantId: string) => {
    try {
      const { added } = await toggleItem(variantId);
      setNotification(added ? "Added to wishlist!" : "Removed from wishlist");
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    }
  };

  return (
    <section className="py-24 md:py-32 lg:py-24 bg-[#f5f3ef]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div className="max-w-2xl">
            <p className="text-sm tracking-widest uppercase text-[#7c6652] mb-6">
              BEST SELLING
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4">
              {title}
            </h2>
            <div className="block md:hidden mb-6">
              <Link href={viewAllHref}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-[#2c353c] text-[#2c353c] bg-transparent px-10 py-4 uppercase tracking-[0.2em] text-lg font-medium rounded-none shadow-none hover:bg-gray-100 w-full"
                >
                  VIEW ALL
                </Button>
              </Link>
            </div>
            <p className="text-gray-600 text-lg w-full whitespace-normal">
              {subtitle}
            </p>
          </div>

          <div className="hidden md:flex md:justify-end w-full md:w-auto mt-0">
            <Link href={viewAllHref} className="self-center">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-[#2c353c] text-[#2c353c] bg-transparent px-10 py-4 uppercase tracking-[0.2em] text-lg font-medium rounded-none shadow-none hover:bg-gray-100"
              >
                VIEW ALL
              </Button>
            </Link>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className="fixed top-20 right-4 bg-[#2c353c] text-white px-6 py-3 rounded-md shadow-lg z-50 animate-in fade-in slide-in-from-right-5">
            {notification}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-10 gap-y-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              handle={product.handle}
              rating={product.rating}
              totalReviews={product.totalReviews}
              sizes={product.sizes}
              sizeToVariantId={product.sizeToVariantId}
              defaultVariantId={product.defaultVariantId}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              isInWishlist={(variantId) =>
                variantId ? isInWishlist(variantId) : false
              }
            />
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-12 text-left">
          <Link
            href={viewAllHref}
            className="inline-flex items-center text-sm tracking-[0.2em] uppercase text-[#8B6B55] hover:text-primary transition-colors"
          >
            SHOP ALL INVESTMENT PIECES
            <span className="ml-2">›</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
