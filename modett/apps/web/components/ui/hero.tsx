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
    <section className="relative w-full h-[620px] md:h-[720px] lg:h-[760px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageSrc})` }}
        role="img"
        aria-label={imageAlt}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/15 to-transparent" />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-between text-center px-6 py-12 md:py-16">
        {/* Empty spacer for vertical balance */}
        <div className="flex-1" />

        {/* Title centered */}
        <div className="max-w-3xl flex-shrink-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-light text-white leading-tight tracking-tight">
            {linesToRender.map((line, index) => (
              <span key={`${line}-${index}`} className="block">
                {line}
              </span>
            ))}
          </h1>

          {subtitle && (
            <p className="text-base md:text-lg text-white/85 mt-6">
              {subtitle}
            </p>
          )}
        </div>

        {/* Empty spacer for vertical balance */}
        <div className="flex-1" />

        {/* Buttons at bottom */}
        <div className="flex w-full max-w-6xl flex-col gap-5 sm:flex-row sm:justify-between sm:items-center px-4 md:px-8 flex-shrink-0">
          {primaryCta && (
            <Link href={primaryCta.href} className="w-full sm:w-auto">
              <button className="w-full sm:w-auto min-w-[220px] px-10 py-3 text-[11px] tracking-[0.32em] uppercase text-white border border-white/80 bg-transparent hover:bg-white/10 transition-all duration-300">
                {primaryCta.text}
              </button>
            </Link>
          )}

          {secondaryCta && (
            <Link href={secondaryCta.href} className="w-full sm:w-auto">
              <button className="w-full sm:w-auto min-w-[220px] px-10 py-3 text-[11px] tracking-[0.32em] uppercase text-white border border-white/80 bg-transparent hover:bg-white/10 transition-all duration-300">
                {secondaryCta.text}
              </button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
