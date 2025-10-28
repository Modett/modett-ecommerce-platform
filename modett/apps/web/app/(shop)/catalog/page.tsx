import { config } from "@/lib/config";
import type { Product } from "@/types";
import { CatalogClient } from "./catalog-client";
import { mediaService } from "@/services/media.service";

async function getAllProducts() {
  try {
    // Fetch media assets to get product images
    const imageMap = await mediaService.getProductImageMap();

    const response = await fetch(
      `${config.apiUrl}/v1/catalog/products?status=published`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();

    // Handle different API response structures
    let productsArray: Product[] = [];
    if (Array.isArray(data)) {
      productsArray = data;
    } else if (data?.data?.products && Array.isArray(data.data.products)) {
      productsArray = data.data.products;
    } else if (data && Array.isArray(data.data)) {
      productsArray = data.data;
    } else if (data && Array.isArray(data.products)) {
      productsArray = data.products;
    } else {
      console.error('Unexpected API response structure:', data);
      return [];
    }

    // Fetch variants for each product
    const productsWithVariants = await Promise.all(
      productsArray.map(async (product: any) => {
        try {
          const variantsRes = await fetch(
            `${config.apiUrl}/v1/catalog/products/${product.productId}/variants`,
            { cache: 'no-store' }
          );

          if (variantsRes.ok) {
            const variantsData = await variantsRes.json();
            // API returns { success, data: [...variants] }
            return {
              ...product,
              variants: variantsData?.data || [],
            };
          }
        } catch (error) {
          console.error(`Failed to fetch variants for product ${product.productId}:`, error);
        }
        return product;
      })
    );

    // Transform products to match the component's expected format
    return productsWithVariants.map((product: any) => {
      const coverMedia = product.media?.find((m: any) => m.isCover);
      let imageUrl = coverMedia?.asset?.storageKey || '';

      // If no media from product, try to get from the dynamic image map
      if (!imageUrl && imageMap) {
        imageUrl = imageMap[product.slug] || '';
      }

      // Ultimate fallback image
      if (!imageUrl) {
        imageUrl = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=1200&fit=crop';
      }

      const sizes = product.variants
        ? [...new Set(product.variants.map((v: any) => v.size).filter(Boolean))]
        : ['XS', 'S', 'M', 'L']; // Fallback sizes

      // Get the first variant's price (API returns price as {value: number})
      const firstVariant = product.variants?.[0];
      const price = firstVariant?.price?.value || firstVariant?.price || 285; // Fallback price

      // Create a map of size to variantId for easy lookup
      const sizeToVariantId: Record<string, string> = {};
      if (product.variants) {
        product.variants.forEach((v: any) => {
          const variantId = v.id?.value || v.id || v.variantId;
          if (variantId && v.size) {
            if (!sizeToVariantId[v.size]) {
              sizeToVariantId[v.size] = variantId;
            }
          }
        });
      }

      const variantCandidates = Object.values(sizeToVariantId);
      if (
        variantCandidates.length === 0 &&
        product.variants &&
        product.variants.length > 0
      ) {
        const fallbackVariant =
          product.variants[0].id?.value ||
          product.variants[0].id ||
          product.variants[0].variantId;
        if (fallbackVariant) {
          variantCandidates.push(fallbackVariant);
        }
      }

      const defaultVariantId = variantCandidates[0];

      return {
        id: product.productId || product.id, // Use productId from API
        name: product.title,
        price: Number(price),
        image: imageUrl,
        handle: product.slug,
        rating: undefined,
        totalReviews: undefined,
        sizes: sizes as string[],
        sizeToVariantId,
        defaultVariantId,
      };
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function CatalogPage() {
  const products = await getAllProducts();

  return (
    <div className="min-h-screen bg-[#f5f3ef] py-16">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-serif font-light text-[#2f4050] mb-8 text-center">
          Our Collections
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Discover our curated selection of timeless pieces, each crafted with care
          and designed to become a cherished part of your wardrobe.
        </p>

        <CatalogClient products={products} />
      </div>
    </div>
  );
}
