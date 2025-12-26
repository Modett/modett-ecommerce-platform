import { ProductCard } from "@/features/product-catalog/components/product-card";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  productId: string;
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  images?: { url: string }[];
  variants?: any[];
}

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ProductGrid({
  products,
  columns = 3,
  className,
}: ProductGridProps) {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:gap-6 lg:gap-8 xl:gap-[32px]",
        gridCols[columns],
        className
      )}
    >
      {products.map((product) => (
        <ProductCard
            key={product.id}
            id={product.id}
            productId={product.productId}
            slug={product.slug}
            title={product.title}
            price={product.price}
            compareAtPrice={product.compareAtPrice || undefined}
            image={product.images?.[0]?.url || "/placeholder-product.jpg"}
            secondaryImage={product.images?.[1]?.url}
            variants={product.variants || []}
          />
      ))}
    </div>
  );
}
