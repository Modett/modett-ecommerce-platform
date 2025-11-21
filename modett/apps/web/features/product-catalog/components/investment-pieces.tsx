'use client';

import { Button } from '@/components/ui/button';
import { ProductCard } from './product-card';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';

export function InvestmentPieces() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productService.getFeaturedProducts(6),
  });

  if (error) {
    console.error('Error loading products:', error);
  }

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
              BEST SELLING
            </p>
            <h2 className="font-serif text-3xl md:text-4xl mb-2">
              INVESTMENT PIECES
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Span from subtle complexity. Crafted for the woman who values
              quiet confidence.
            </p>
          </div>
          <Button variant="outline" className="hidden md:inline-flex">
            VIEW ALL
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-gray-100 animate-pulse rounded"
              />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                image={product.images?.[0]?.url || '/placeholder-product.jpg'}
                variants={product.variants || []}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No products available at the moment.
          </div>
        )}

        <div className="mt-8 text-center">
          <Button variant="link" className="text-sm uppercase tracking-wider">
            SHOP ALL INVESTMENT PIECES
          </Button>
        </div>
      </div>
    </section>
  );
}
