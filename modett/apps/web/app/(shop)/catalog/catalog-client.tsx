"use client";

import { useState } from "react";
import ProductCard from "@/features/product-catalog/components/product-card";
import { useCart, useWishlist } from "@/contexts";

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

interface CatalogClientProps {
  products: Product[];
}

export function CatalogClient({ products }: CatalogClientProps) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [notification, setNotification] = useState<string | null>(null);

  const handleAddToCart = async (productId: string, size: string) => {
    try {
      // Find the product to get its variant mapping
      const product = products.find((p) => p.id === productId);
      if (!product) {
        throw new Error("Product not found");
      }

      // Get the variant ID for the selected size
      const variantId = product.sizeToVariantId?.[size];
      if (!variantId) {
        throw new Error(`Variant not found for size ${size}`);
      }

      await addItem({
        variantId,
        qty: 1,
      });

      setNotification("Added to cart!");
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setNotification("Failed to add to cart");
      setTimeout(() => setNotification(null), 3000);
    }
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
    <>
      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-4 bg-[#2c353c] text-white px-6 py-3 rounded-md shadow-lg z-50 animate-in fade-in slide-in-from-right-5">
          {notification}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center text-gray-500 col-span-full py-12">
          No products available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-10 gap-y-8 mt-12">
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
      )}
    </>
  );
}
