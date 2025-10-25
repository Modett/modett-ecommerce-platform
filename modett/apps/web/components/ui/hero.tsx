import Link from "next/link";

// ============================================================================
// Types
// ============================================================================

interface CallToAction {
  text: string;
  href: string;
}

interface HeroProps {
  title: string | string[];
  subtitle?: string;
  imageSrc: string;
  imageAlt?: string;
  primaryCta?: CallToAction;
  secondaryCta?: CallToAction;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parses the title into an array of lines for rendering
 */
function parseTitleLines(title: string | string[]): string[] {
  if (Array.isArray(title)) {
    return title;
  }

  // Split by newlines and filter out empty lines
  const lines = title
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  // If no lines after parsing, return the original title
  return lines.length > 0 ? lines : [title];
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Hero background image with gradient overlay
 */
const HeroBackground = ({ imageSrc, imageAlt }: { imageSrc: string; imageAlt: string }) => (
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{ backgroundImage: `url(${imageSrc})` }}
    role="img"
    aria-label={imageAlt}
  >
    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/15 to-transparent" />
  </div>
);

/**
 * Hero title component
 */
const HeroTitle = ({ lines }: { lines: string[] }) => (
  <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-light text-white leading-tight tracking-tight">
    {lines.map((line, index) => (
      <span key={`${line}-${index}`} className="block">
        {line}
      </span>
    ))}
  </h1>
);

/**
 * Hero subtitle component
 */
const HeroSubtitle = ({ subtitle }: { subtitle?: string }) => {
  if (!subtitle) return null;

  return (
    <p className="text-base md:text-lg text-white/85 mt-6">
      {subtitle}
    </p>
  );
};

/**
 * Call-to-action button component
 */
const CTAButton = ({ cta, className = "" }: { cta: CallToAction; className?: string }) => (
  <Link href={cta.href} className="w-full sm:w-auto">
    <button
      className={`w-full sm:w-auto min-w-[220px] px-10 py-3 text-[11px] tracking-[0.32em] uppercase text-white border border-white/80 bg-transparent hover:bg-white/10 transition-all duration-300 ${className}`}
    >
      {cta.text}
    </button>
  </Link>
);

/**
 * Hero action buttons (primary and secondary CTAs)
 */
const HeroActions = ({
  primaryCta,
  secondaryCta,
}: {
  primaryCta?: CallToAction;
  secondaryCta?: CallToAction;
}) => {
  // Don't render if no CTAs are provided
  if (!primaryCta && !secondaryCta) return null;

  return (
    <div className="flex w-full max-w-6xl flex-col gap-5 sm:flex-row sm:justify-between sm:items-center px-4 md:px-8 flex-shrink-0">
      {/* Primary CTA Button */}
      {primaryCta && <CTAButton cta={primaryCta} />}

      {/* Secondary CTA Button */}
      {secondaryCta && <CTAButton cta={secondaryCta} />}
    </div>
  );
};

// ============================================================================
// Main Hero Component
// ============================================================================

export function Hero({
  title,
  subtitle,
  imageSrc,
  imageAlt = "Hero image",
  primaryCta,
  secondaryCta,
}: HeroProps) {
  // Parse title into individual lines
  const titleLines = parseTitleLines(title);

  return (
    <section className="relative w-full h-[620px] md:h-[720px] lg:h-[760px] overflow-hidden">
      {/* Background Image with Overlay */}
      <HeroBackground imageSrc={imageSrc} imageAlt={imageAlt} />

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between text-center px-6 py-12 md:py-16">
        {/* Top Spacer - Pushes content to center */}
        <div className="flex-1" />

        {/* Hero Content - Centered */}
        <div className="max-w-3xl flex-shrink-0">
          {/* Title */}
          <HeroTitle lines={titleLines} />

          {/* Subtitle (optional) */}
          <HeroSubtitle subtitle={subtitle} />
        </div>

        {/* Bottom Spacer - Pushes content to center */}
        <div className="flex-1" />

        {/* Call-to-Action Buttons - Bottom */}
        <HeroActions primaryCta={primaryCta} secondaryCta={secondaryCta} />
      </div>
    </section>
  );
}
