// ============================================================================
// PRODUCT CATALOG UTILITIES
// ============================================================================

import type { Product, ProductVariant } from "./types";

/**
 * Find the lowest priced variant from a list of variants
 */
export const getLowestPriceVariant = (
  variants?: ProductVariant[]
): ProductVariant | undefined => {
  if (!variants || variants.length === 0) return undefined;

  return variants.sort(
    (a, b) => parseFloat(a.price || "0") - parseFloat(b.price || "0")
  )[0];
};

/**
 * Transform raw API product data to Product interface
 */
export const transformProduct = (rawProduct: any): Product => {
  const lowestPriceVariant = getLowestPriceVariant(rawProduct.variants);

  return {
    id: rawProduct.productId,
    productId: rawProduct.productId,
    title: rawProduct.title,
    slug: rawProduct.slug,
    description: rawProduct.shortDesc,
    price: lowestPriceVariant ? parseFloat(lowestPriceVariant.price || "0") : 0,
    compareAtPrice: lowestPriceVariant?.compareAtPrice
      ? parseFloat(lowestPriceVariant.compareAtPrice)
      : undefined,
    brand: rawProduct.brand,
    images: rawProduct.images || [],
    variants: rawProduct.variants || [],
    categories: rawProduct.categories || [],
  };
};

/**
 * Sort products by price
 */
export const sortProductsByPrice = (
  products: Product[],
  direction: "asc" | "desc"
): Product[] => {
  return [...products].sort((a, b) => {
    if (direction === "asc") {
      return a.price - b.price;
    } else {
      return b.price - a.price;
    }
  });
};

/**
 * Calculate size counts from products
 */
export const calculateSizeCounts = (
  products: any[]
): Array<{ id: string; count: number }> => {
  const sizeCounts: Record<string, number> = {};

  products.forEach((product) => {
    product.variants?.forEach((variant: any) => {
      if (variant.size && variant.inventory > 0) {
        sizeCounts[variant.size] = (sizeCounts[variant.size] || 0) + 1;
      }
    });
  });

  return Object.entries(sizeCounts)
    .map(([size, count]) => ({ id: size, count }))
    .sort((a, b) => {
      const numA = parseInt(a.id);
      const numB = parseInt(b.id);
      // If both are valid numbers, sort numerically
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.id.localeCompare(b.id);
    });
};

/**
 * Calculate color counts from products
 */
export const calculateColorCounts = (
  products: any[]
): Array<{ id: string; count: number }> => {
  const colorCounts: Record<string, number> = {};

  products.forEach((product) => {
    product.variants?.forEach((variant: any) => {
      if (variant.color && variant.inventory > 0) {
        colorCounts[variant.color] = (colorCounts[variant.color] || 0) + 1;
      }
    });
  });

  return Object.entries(colorCounts)
    .map(([color, count]) => ({ id: color, count }))
    .sort((a, b) => a.id.localeCompare(b.id));
};
