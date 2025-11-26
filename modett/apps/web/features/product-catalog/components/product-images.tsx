"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";

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
  const displayImages = images.length > 0 ? images : [{ url: "/placeholder-product.jpg", alt: "Product" }];

  return (
    <div className="flex flex-col gap-[16px] w-[904px]">
      {/* Main Image */}
      <div className="relative w-full aspect-[444/565] bg-gray-100 overflow-hidden">
        <Image
          src={displayImages[selectedImage]?.url || "/placeholder-product.jpg"}
          alt={displayImages[selectedImage]?.alt || "Product image"}
          fill
          className="object-cover"
          priority
        />
        {/* Wishlist Button */}
        <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Heart className="w-5 h-5 text-[#232D35]" />
        </button>
      </div>

      {/* Thumbnail Grid - 2 columns */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-2 gap-[16px]">
          {displayImages.slice(1, 6).map((image, index) => (
            <button
              key={index + 1}
              onClick={() => setSelectedImage(index + 1)}
              className={`relative w-full aspect-[444/565] bg-gray-100 overflow-hidden transition-opacity ${
                selectedImage === index + 1 ? "ring-2 ring-[#232D35]" : "hover:opacity-80"
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt || `Product image ${index + 2}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
