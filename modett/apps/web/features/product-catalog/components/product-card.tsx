'use client';

import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  rating?: number;
  sizes?: string[];
}

export function ProductCard({
  title,
  price,
  compareAtPrice,
  image,
  rating = 5,
  sizes = ['XS', 'S', 'M', 'L', 'XL']
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div className="group">
      <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
        >
          <Heart
            className={`h-4 w-4 ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex gap-1 justify-center">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-3 py-1 text-xs border transition-colors ${
                selectedSize === size
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <Button variant="default" size="sm" className="w-full">
          ADD TO CART
        </Button>

        <div>
          <h3 className="text-sm font-medium mb-1">{title}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">${price.toFixed(2)}</span>
              {compareAtPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  ${compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${
                    i < rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
