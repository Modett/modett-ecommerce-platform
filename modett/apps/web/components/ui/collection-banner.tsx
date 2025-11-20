import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface CollectionBannerProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonHref?: string;
  imageSrc: string;
}

export function CollectionBanner({
  title,
  subtitle,
  buttonText,
  buttonHref = '#',
  imageSrc
}: CollectionBannerProps) {
  return (
    <section className="relative h-[400px] md:h-[500px] w-full">
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
        {subtitle && (
          <p className="text-sm uppercase tracking-wider mb-2">{subtitle}</p>
        )}
        <h2 className="font-serif text-4xl md:text-5xl mb-6 tracking-tight">
          {title}
        </h2>
        <Button
          variant="outline"
          className="bg-transparent text-white border-white hover:bg-white/10"
          asChild
        >
          <a href={buttonHref}>{buttonText}</a>
        </Button>
      </div>
    </section>
  );
}
