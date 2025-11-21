'use client';

import Image from 'next/image';
import { Heart, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cartService } from '@/services/cart.service';
import { wishlistService } from '@/services/wishlist.service';
import { toast } from 'sonner';

interface Variant {
  id: string;
  size?: string;
  color?: string;
  sku: string;
  inventory: number;
}

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  variants: Variant[];
  rating?: number;
}

export function ProductCard({
  title,
  price,
  image,
  variants,
}: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // Get the first variant as default for wishlist
  const defaultVariant = variants[0];

  // Check if item is in wishlist on mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (defaultVariant) {
        try {
          const inWishlist = await wishlistService.isInWishlist(defaultVariant.id);
          setIsWishlisted(inWishlist);
        } catch (error) {
          // Silently fail - wishlist check is not critical
        }
      }
    };

    checkWishlistStatus();
  }, [defaultVariant?.id]);

  // Get unique sizes from variants
  const availableSizes = Array.from(
    new Set(variants.map((v) => v.size).filter(Boolean))
  );

  // Get unique colors from variants
  const availableColors = Array.from(
    new Set(variants.map((v) => v.color).filter(Boolean))
  );

  const handleSizeSelect = (size: string) => {
    // Find variant with this size
    const variant = variants.find((v) => v.size === size);
    setSelectedVariant(variant || null);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Please select a size');
      return;
    }

    setIsAddingToCart(true);
    try {
      await cartService.addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
      });

      toast.success(`${title} added to cart!`);

      // Optionally collapse the card after adding to cart
      setTimeout(() => setIsExpanded(false), 1000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!defaultVariant) {
      toast.error('Product variant not available');
      return;
    }

    setIsTogglingWishlist(true);
    try {
      if (isWishlisted) {
        // Remove from wishlist
        await wishlistService.removeFromWishlist(defaultVariant.id);
        setIsWishlisted(false);
        toast.success(`${title} removed from wishlist`);
      } else {
        // Add to wishlist
        await wishlistService.addToWishlist(defaultVariant.id);
        setIsWishlisted(true);
        toast.success(`${title} added to wishlist!`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wishlist');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <div className="group bg-white">
      {/* Product Image */}
      <div className="relative aspect-[3/4] mb-3 overflow-hidden bg-gray-50">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />

        {/* Wishlist Heart - Only show when expanded */}
        {isExpanded && (
          <button
            onClick={handleWishlistToggle}
            disabled={isTogglingWishlist}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow z-10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart
              className={`h-4 w-4 transition-all ${
                isWishlisted ? 'fill-black text-black' : 'text-gray-600'
              } ${isTogglingWishlist ? 'animate-pulse' : ''}`}
            />
          </button>
        )}

        {/* Size Selector and Add to Cart - Only show when expanded */}
        {isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-4">
            <p className="text-xs text-center text-gray-600 mb-2">
              {availableSizes.length > 0 ? 'Available sizes' : 'Select variant'}
            </p>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size!)}
                  className={`py-1.5 text-xs font-medium border transition-colors ${
                    selectedVariant?.size === size
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <Button
              variant="default"
              onClick={handleAddToCart}
              disabled={!selectedVariant || isAddingToCart}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white text-xs tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 animate-pulse" />
                  ADDING...
                </span>
              ) : (
                'ADD TO CART'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="relative">
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1">
            <h3 className="text-sm text-gray-800 mb-1">{title}</h3>
            <p className="text-sm font-medium text-gray-900 mb-2">Rs {price.toFixed(2)}</p>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
          >
            {isExpanded ? (
              <Minus className="h-5 w-5 text-gray-800" />
            ) : (
              <Plus className="h-5 w-5 text-gray-800" />
            )}
          </button>
        </div>

        {/* Color Swatches - Show available colors */}
        {availableColors.length > 0 && (
          <div className="flex gap-1.5">
            {availableColors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="px-2 py-0.5 text-xs border border-gray-300 rounded"
                title={color}
              >
                {color}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
