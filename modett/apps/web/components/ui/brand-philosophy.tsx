import Link from "next/link"

interface BrandPhilosophyProps {
  title?: string
  description?: string
  imageSrc: string
  ctaText?: string
  ctaHref?: string
}

export function BrandPhilosophy({
  title = "A philosophy of buying fewer, better pieces.",
  description = "We craft investment-quality garments from the finest natural fabrics, designed to endure for years, not seasons.",
  imageSrc,
  ctaText = "LEARN MORE",
  ctaHref = "/about",
}: BrandPhilosophyProps) {
  return (
    <section className="bg-[#ede9e3] py-20 md:py-24">
      <div className="container mx-auto px-4">
        {/* Full Width Image */}
        <div className="w-full mb-12 md:mb-16">
          <img
            src={imageSrc}
            alt="Brand philosophy"
            className="w-full h-[350px] md:h-[450px] object-cover"
          />
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <p className="text-[#4a4440] text-base md:text-lg leading-relaxed px-4">
              {title} {description}
            </p>

            <Link href={ctaHref} className="inline-flex items-center group">
              <span className="text-sm tracking-[0.2em] uppercase text-[#8B6B55] hover:text-[#6d5542] transition-colors">
                {ctaText}
              </span>
              <span className="ml-2 text-[#8B6B55] group-hover:text-[#6d5542] transition-colors">›</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}