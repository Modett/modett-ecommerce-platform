import Link from "next/link"
import { Button } from "./button"

interface CollectionBannerProps {
  title: string
  subtitle?: string
  imageSrc: string
  href: string
  ctaText?: string
}

export function CollectionBanner({
  title,
  subtitle,
  imageSrc,
  href,
  ctaText = "EXPLORE",
}: CollectionBannerProps) {
  return (
    <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageSrc})` }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        {subtitle && (
          <p className="text-sm md:text-base tracking-widest uppercase text-white/80 mb-3">
            {subtitle}
          </p>
        )}

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 md:mb-8">
          {title}
        </h2>

        <Link href={href}>
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent backdrop-blur-sm text-white border-white hover:bg-white hover:text-primary"
          >
            {ctaText}
          </Button>
        </Link>
      </div>
    </section>
  )
}
