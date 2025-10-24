import Link from "next/link";

interface HeroProps {
  title: string | string[];
  subtitle?: string;
  imageSrc: string;
  imageAlt?: string;
  primaryCta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
}

export function Hero({
  title,
  subtitle,
  imageSrc,
  imageAlt = "Hero image",
  primaryCta,
  secondaryCta,
}: HeroProps) {
  const parsedTitle =
    typeof title === "string"
      ? title
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean)
      : title;

  const linesToRender =
    parsedTitle.length > 0
      ? parsedTitle
      : [typeof title === "string" ? title : title.join(" ")];

  return (
    <section className="relative w-full h-[520px] md:h-[600px] lg:h-[680px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageSrc})` }}
        role="img"
        aria-label={imageAlt}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-between text-center px-6 sm:px-12 py-12 md:py-16">
        {/* Spacer */}
        <div></div>

        {/* Title Group - Centered */}
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-light text-white mb-6 md:mb-8 leading-tight max-w-3xl">
            {linesToRender.map((line, index) => (
              <span key={`${line}-${index}`} className="block">
                {line}
              </span>
            ))}
          </h1>

          {subtitle && (
            <p className="text-base md:text-lg text-white/80 max-w-xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* CTAs - Bottom */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-3xl justify-center sm:justify-between items-center">
          {primaryCta && (
            <Link href={primaryCta.href}>
              <button className="px-10 py-3 text-[11px] tracking-[0.35em] uppercase text-white border border-white/80 bg-white/0 hover:bg-white hover:text-gray-900 transition-all duration-300 w-[240px]">
                {primaryCta.text}
              </button>
            </Link>
          )}

          {secondaryCta && (
            <Link href={secondaryCta.href}>
              <button className="px-10 py-3 text-[11px] tracking-[0.35em] uppercase text-white border border-white/80 bg-white/0 hover:bg-white hover:text-gray-900 transition-all duration-300 w-[240px]">
                {secondaryCta.text}
              </button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
