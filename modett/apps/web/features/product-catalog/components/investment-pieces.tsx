import { Button } from '@/components/ui/button';
import { ProductCard } from './product-card';

const MOCK_PRODUCTS = [
  {
    id: '1',
    title: 'Crispy silk shirt',
    price: 285.00,
    compareAtPrice: 385.00,
    image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=800&h=1200&fit=crop',
    rating: 5,
  },
  {
    id: '2',
    title: 'Crispy silk shirt',
    price: 285.00,
    compareAtPrice: 385.00,
    image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=1200&fit=crop',
    rating: 5,
  },
  {
    id: '3',
    title: 'Crispy silk shirt',
    price: 285.00,
    compareAtPrice: 385.00,
    image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&h=1200&fit=crop',
    rating: 5,
  },
  {
    id: '4',
    title: 'Crispy silk shirt',
    price: 285.00,
    compareAtPrice: 385.00,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1200&fit=crop',
    rating: 5,
  },
  {
    id: '5',
    title: 'Crispy silk shirt',
    price: 285.00,
    compareAtPrice: 385.00,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1200&fit=crop',
    rating: 5,
  },
  {
    id: '6',
    title: 'Crispy silk shirt',
    price: 285.00,
    compareAtPrice: 385.00,
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&h=1200&fit=crop',
    rating: 5,
  },
];

export function InvestmentPieces() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
              BEST SELLING
            </p>
            <h2 className="font-serif text-3xl md:text-4xl mb-2">
              INVESTMENT PIECES
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Span from subtle complexity. Crafted for the woman who values quiet confidence.
            </p>
          </div>
          <Button variant="outline" className="hidden md:inline-flex">
            VIEW ALL
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="link" className="text-sm uppercase tracking-wider">
            SHOP ALL INVESTMENT PIECES 
          </Button>
        </div>
      </div>
    </section>
  );
}
