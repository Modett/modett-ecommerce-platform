import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCard } from "./product-card"

interface Product {
  id: string
  name: string
  price: number
  image: string
  handle: string
  rating?: number
  totalReviews?: number
  sizes?: string[]
}

interface InvestmentPiecesProps {
  title?: string
  subtitle?: string
  products: Product[]
  viewAllHref?: string
}

export function InvestmentPieces({
  title = "INVESTMENT PIECES",
  subtitle = "Born from subtle complexity. Crafted for the woman who values quiet confidence.",
  products,
  viewAllHref = "/catalog",
}: InvestmentPiecesProps) {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-[#f5f3ef]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <p className="text-xs tracking-widest uppercase text-gray-500 mb-2">
              BEST SELLING
            </p>
            <h2 className="text-3xl md:text-4xl font-serif mb-2">{title}</h2>
            <p className="text-gray-600 max-w-xl">{subtitle}</p>
          </div>

          <Link href={viewAllHref} className="mt-6 md:mt-0">
            <Button variant="outline" size="lg">
              VIEW ALL
            </Button>
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
            />
          ))}
        </div>

        {/* View All Link - Mobile */}
        <div className="mt-12 text-center lg:hidden">
          <Link
            href={viewAllHref}
            className="inline-flex items-center text-sm tracking-wider uppercase text-gray-700 hover:text-primary transition-colors"
          >
            SHOP ALL INVESTMENT PIECES
            <span className="ml-2">›</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
