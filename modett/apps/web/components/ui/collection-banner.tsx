interface CollectionBannerProps {
  title: string;
  subtitle?: string;
  imageSrc?: string;
  secondaryTitle?: string;
  secondarySubtitle?: string;
}

export function CollectionBanner({
  title,
  subtitle,
  secondaryTitle,
  secondarySubtitle,
  imageSrc,
}: CollectionBannerProps) {
  return (
    <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] flex flex-col justify-center items-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: imageSrc ? `url(${imageSrc})` : undefined }}
      />
      <div className="relative w-full flex flex-col items-center justify-center text-center px-4 mt-16 md:mt-24 lg:mt-32">
        {subtitle && (
          <p className="text-[13px] md:text-base tracking-[0.25em] uppercase text-[#c4a572] mb-2 font-medium">
            {subtitle}
          </p>
        )}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#f5f3ef] mb-2">
          {title}
        </h2>
        <div className="w-full max-w-4xl h-[1.5px] bg-[#c4a572]/40 my-6"></div>
        {secondarySubtitle && (
          <p className="text-[13px] md:text-base tracking-[0.25em] uppercase text-[#c4a572] mb-2 font-medium">
            {secondarySubtitle}
          </p>
        )}
        {secondaryTitle && (
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#f5f3ef]">
            {secondaryTitle}
          </h2>
        )}
      </div>
    </section>
  );
}
