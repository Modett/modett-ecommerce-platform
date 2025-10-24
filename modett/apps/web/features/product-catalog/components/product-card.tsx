"use client"

import * as React from "react"
import Link from "next/link"
import { Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  id: string
  name: string
  price: number
  currency?: string
  image: string
  rating?: number
  totalReviews?: number
  sizes?: string[]
  handle: string
  onAddToCart?: (productId: string, size: string) => void
  onToggleWishlist?: (productId: string) => void
  isInWishlist?: boolean
}

export function ProductCard({
  id,
  name,
  price,
  currency = "₹",
  image,
  rating = 0,
  totalReviews = 0,
  sizes = ["XS", "S", "M", "L", "XL"],
  handle,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null)
  const [isHovered, setIsHovered] = React.useState(false)

  const handleAddToCart = () => {
    if (selectedSize && onAddToCart) {
      onAddToCart(id, selectedSize)
    }
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onToggleWishlist) {
      onToggleWishlist(id)
    }
  }

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
        {/* Image */}
        <Link href={`/product/${handle}`}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              isInWishlist ? "fill-red-500 text-red-500" : "text-gray-700"
            )}
          />
        </button>

        {/* Quick Add - Desktop Only */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-white p-4 transition-transform duration-300 hidden md:block",
            isHovered ? "translate-y-0" : "translate-y-full"
          )}
        >
          {/* Size Selector */}
          <div className="flex gap-2 mb-3">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "flex-1 py-2 text-xs font-medium border transition-colors",
                  selectedSize === size
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                )}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className="w-full"
            size="sm"
          >
            ADD TO CART
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <Link href={`/product/${handle}`}>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
            {name}
          </h3>

          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-gray-900">
              {currency} {price.toFixed(2)}
            </p>

            {/* Ratings */}
            {rating > 0 && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    )}
                  />
                ))}
                {totalReviews > 0 && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({totalReviews})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}