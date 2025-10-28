import { Hero } from "@/components/ui/hero";
import { InvestmentPieces } from "@/features/product-catalog/components/investment-pieces";
import { CollectionBanner } from "@/components/ui/collection-banner";
import { BrandPhilosophy } from "@/components/ui/brand-philosophy";
import { Newsletter } from "@/features/engagement/components/newsletter";
import { config } from "@/lib/config";
import type { Product } from "@/types";
import { mediaService } from "@/services/media.service";

// Fetch products from the Investment Pieces category
async function getInvestmentPieces() {
  try {
    // Fetch media assets to get product images
    const imageMap = await mediaService.getProductImageMap();

    // First, get the Investment Pieces category
    const categoriesRes = await fetch(`${config.apiUrl}/v1/catalog/categories`, {
      cache: 'no-store', // Always get fresh data
    });

    if (!categoriesRes.ok) {
      throw new Error('Failed to fetch categories');
    }

    const categoriesData = await categoriesRes.json();
    const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData.data || [];
    const investmentCategory = categories.find(
      (cat: any) => cat.slug === 'investment-pieces'
    );

    if (!investmentCategory) {
      console.error('Investment Pieces category not found');
      return [];
    }

    // Get products in the Investment Pieces category
    const productsRes = await fetch(
      `${config.apiUrl}/v1/catalog/products?limit=6&status=published`,
      {
        cache: 'no-store',
      }
    );

    if (!productsRes.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await productsRes.json();

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
      // Get the first available image
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

      // Get available sizes from variants
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
        rating: undefined, // We don't have reviews yet
        totalReviews: undefined,
        sizes: sizes as string[],
        sizeToVariantId,
        defaultVariantId,
      };
    });
  } catch (error) {
    console.error('Error fetching investment pieces:', error);
    return [];
  }
}

export default async function HomePage() {
  const featuredProducts = await getInvestmentPieces();

  return (
    <>
      {/* Hero Section */}
      <Hero
        title={["Quiet luxury.", "Timeless craft."]}
        imageSrc="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1920&h=1080&fit=crop&auto=format"
        imageAlt="Woman in a linen set standing on a beach at sunset"
        primaryCta={{
          text: "SHOP COLLECTION",
          href: "/catalog",
        }}
        secondaryCta={{
          text: "OUR JOURNAL",
          href: "/journal",
        }}
      />

      {/* Investment Pieces Section */}
      <InvestmentPieces
        products={featuredProducts}
        subtitle="Born from subtle complexity. Crafted for the woman who values quiet confidence."
      />

      {/* Combined Banner: Collections & The Journal */}
      <CollectionBanner
        title="COLLECTIONS"
        subtitle="SIGNATURE"
        secondaryTitle="THE JOURNAL"
        secondarySubtitle="BEHIND THE CRAFT"
        imageSrc="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1920&h=1080&fit=crop"
      />

      {/* Brand Philosophy Section */}
      <BrandPhilosophy imageSrc="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&h=800&fit=crop" />

      {/* Newsletter Section */}
      <Newsletter />
    </>
  );
}
