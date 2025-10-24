import Link from "next/link"
import { Button } from "./button"

interface BrandPhilosophyProps {
  title?: string
  description?: string
  imageSrc: string
  ctaText?: string
  ctaHref?: string
}

export function BrandPhilosophy({
  title = "A philosophy of buying fewer, better fabrics",
  description = "We craft investment-quality garments from the finest natural fabrics, designed to endure for years, not seasons.",
  imageSrc,
  ctaText = "LEARN MORE ›",
  ctaHref = "/about",
}: BrandPhilosophyProps) {
  return (
    <section className="py-16 md:py-20 bg-[#f5f3ef]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Image */}
          <div className="order-2 lg:order-1">
            <div className="aspect-[4/3] md:aspect-[3/2] overflow-hidden rounded-lg">
              <img
                src={imageSrc}
                alt="Brand philosophy"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2 space-y-6">
            <div>
              <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">
                SLOW FASHION
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4">
                {title}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {description}
              </p>
            </div>

            <Link href={ctaHref}>
              <Button variant="outline" size="lg">
                {ctaText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}