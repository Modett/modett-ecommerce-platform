"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImage {
  url: string;
  alt?: string;
}

interface ProductImagesProps {
  images: ProductImage[];
}

export function ProductImages({ images }: ProductImagesProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  // If no images, show placeholder
  const displayImages =
    images.length > 0
      ? images
      : [
          {
            url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='1600'%3E%3Crect width='1200' height='1600' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E",
            alt: "Product",
          },
        ];

  return (
    <div className="w-full max-w-[904px]">
      {/* All Images Grid - 2 columns, all same size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        {displayImages.slice(0, 6).map((image, index) => (
          <div
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`relative w-full h-[607px] md:h-auto md:aspect-[444/565] bg-gray-100 overflow-hidden transition-all cursor-pointer ${
              selectedImage === index
                ? "ring-2 ring-[#232D35]"
                : "hover:opacity-80"
            }`}
          >
            <Image
              src={image.url}
              alt={image.alt || `Product image ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
