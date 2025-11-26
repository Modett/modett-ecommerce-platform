"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ChevronDown } from "lucide-react";
import { getColorHex } from "@/lib/colors";
import { cartService } from "@/services/cart.service";
import { wishlistService } from "@/services/wishlist.service";
import { toast } from "sonner";

interface Variant {
  id: string;
  size?: string;
  color?: string;
  inventory: number;
}

interface Product {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  description?: string;
  variants?: Variant[];
}

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [isFabricOpen, setIsFabricOpen] = useState(false);
  const [isSustainabilityOpen, setIsSustainabilityOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const defaultVariant = product.variants?.[0];

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (product.variants && product.variants.length > 0) {
        try {
          const variantIds = product.variants.map(v => v.id);
          const inWishlist = await wishlistService.isProductInWishlist(variantIds);
          setIsWishlisted(inWishlist);
        } catch (error) {}
      }
    };

    checkWishlistStatus();

    const handleWishlistUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { productId: eventProductId, action } = customEvent.detail;

      if (eventProductId && eventProductId === product.id) {
        setIsWishlisted(action === 'add');
      }
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, [product.id, product.variants]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    const selectedVariant = product.variants?.find(
      v => v.size === selectedSize && (!selectedColor || v.color === selectedColor)
    );

    if (!selectedVariant) {
      toast.error("Selected variant not available");
      return;
    }

    setIsAddingToCart(true);
    try {
      await cartService.addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
      });

      toast.success(`${product.title} added to cart!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!defaultVariant) {
      toast.error("Product variant not available");
      return;
    }

    setIsTogglingWishlist(true);
    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(defaultVariant.id, product.id);
        setIsWishlisted(false);
        toast.success(`${product.title} removed from wishlist`);
      } else {
        await wishlistService.addToWishlist(defaultVariant.id, product.id);
        setIsWishlisted(true);
        toast.success(`${product.title} added to wishlist!`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update wishlist");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const sizes = Array.from(
    new Set(product.variants?.map((v) => v.size).filter(Boolean))
  ).sort((a, b) => {
    const numA = parseInt(a!);
    const numB = parseInt(b!);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a!.localeCompare(b!);
  });

  // Get unique colors from variants
  const colors = Array.from(
    new Set(product.variants?.map((v) => v.color).filter(Boolean))
  );

  return (
    <div className="flex flex-col gap-[10px] w-full max-w-[300px] pr-[1px] pt-[10px] sticky top-0">
      {/* Product Title */}
      <div className="flex flex-col gap-[9px] w-full max-w-[330px]">
        <h1
          className="text-[18px] leading-[28px] font-normal"
          style={{ fontFamily: "Raleway, sans-serif", color: "#232D35", letterSpacing: "0%" }}
        >
          {product.title}
        </h1>
      </div>

      {/* Color Selection */}
      <div className="flex flex-col gap-[12px] w-full max-w-[299px] h-[81px] px-[15px] py-[10px] border-t border-b border-[#E5E0D6]">
        <p
          className="text-[14px] leading-[20px] font-medium uppercase tracking-[2px]"
          style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
        >
          COLOUR: {selectedColor || colors[0] || ""}
        </p>
        {colors.length > 0 && (
          <div className="flex items-center w-[120px] h-[20px]" style={{ gap: "13.33px" }}>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color!)}
                className={`w-5 h-5 rounded-full transition-all ${
                  selectedColor === color ||
                  (!selectedColor && color === colors[0])
                    ? "border-[2px] border-[#232D35]"
                    : "border border-gray-300 hover:border-gray-400"
                }`}
                style={{ backgroundColor: getColorHex(color) }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Size Selection */}
      <div className="flex flex-col gap-[12px] w-full max-w-[299px] px-[15px] pt-[10px]">
        <div className="flex items-center justify-between w-full max-w-[269px] h-[40px]">
          <p
            className="text-[14px] leading-[20px] font-medium uppercase tracking-[2px]"
            style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
          >
            Size: {selectedSize || ""}
          </p>
          <button
            className="text-[14px] leading-[20px] font-medium h-[40px]"
            style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
          >
            Fit Chart
          </button>
        </div>
        <div className="grid grid-cols-5 gap-[8px] w-full max-w-[269px] h-[80px]">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size!)}
              className={`h-[48px] border transition-all ${
                selectedSize === size
                  ? "bg-[#232D35] text-white border-[#232D35]"
                  : "bg-white text-[#232D35] border-[#D4C4A8] hover:border-[#232D35]"
              }`}
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Add to Cart & Wishlist */}
      <div className="flex w-full max-w-[300px] pt-[16px] gap-[1px]">
        <Button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="flex-1 max-w-[254px] h-[50px] bg-[#232D35] text-white hover:bg-[#232D35]/90 rounded-none text-[16px] font-medium uppercase tracking-[4px] border border-[#232D35] pt-[15.5px] pr-[31px] pb-[16.5px] pl-[31px] disabled:opacity-50"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          {isAddingToCart ? "ADDING..." : "ADD TO CART"}
        </Button>
        <Button
          onClick={handleWishlist}
          disabled={isTogglingWishlist}
          variant="outline"
          className="h-[50px] w-[46px] flex-shrink-0 bg-[#232D35] border-[#232D35] text-white hover:bg-white hover:text-[#232D35] transition-all rounded-none p-0 pl-[1px] disabled:opacity-50"
        >
          <Heart
            className={`w-5 h-5 transition-all ${isWishlisted ? "fill-white" : ""} ${isTogglingWishlist ? "animate-pulse" : ""}`}
            strokeWidth={2}
          />
        </Button>
      </div>

      {/* Product Description */}
      <div className="flex flex-col w-full max-w-[300px] h-[373px] pt-[40px] gap-[8px]">
        <button
          onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
          className="flex items-center justify-between py-[20px]"
        >
          <span
            className="text-[16px] leading-[24px] font-medium uppercase tracking-[2px]"
            style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
          >
            DESCRIPTION
          </span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${isDescriptionOpen ? "rotate-180" : ""}`}
          />
        </button>
        {isDescriptionOpen && (
          <div className="pb-[20px]">
            <p
              className="text-[14px] leading-[22px] font-normal"
              style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
            >
              {product.description ||
                "Crafted from 100% pure, natural silk with a refined drape. This classic shirt embodies quiet luxury with short sleeves for everyday luxury. Its advanced cut structure includes front-button details and a versatile composition. Designed to move effortlessly from day to night while maintaining a timeless elegance that defies of trend-compliance. Its a modern, contemporary elegance, making it a timeless cornerstone for the modern wardrobe."}
            </p>
          </div>
        )}
      </div>

      {/* Collapsible Sections Container */}
      <div className="w-full max-w-[300px] h-[210px] overflow-hidden">
        {/* Design */}
        <div className="flex flex-col border-t border-[#D4C4A8]">
        <button
          onClick={() => setIsDesignOpen(!isDesignOpen)}
          className="flex items-center justify-between py-[20px]"
        >
          <span
            className="text-[16px] leading-[24px] font-medium uppercase tracking-[2px]"
            style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
          >
            DESIGN
          </span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${isDesignOpen ? "rotate-180" : ""}`}
          />
        </button>
        {isDesignOpen && (
          <div className="pb-[20px]">
            <p
              className="text-[14px] leading-[22px] font-normal"
              style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
            >
              Classic shirt design with modern silhouette and refined details.
            </p>
          </div>
        )}
      </div>

      {/* Fabric */}
      <div className="flex flex-col border-t border-[#D4C4A8]">
        <button
          onClick={() => setIsFabricOpen(!isFabricOpen)}
          className="flex items-center justify-between py-[20px]"
        >
          <span
            className="text-[16px] leading-[24px] font-medium uppercase tracking-[2px]"
            style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
          >
            FABRIC
          </span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${isFabricOpen ? "rotate-180" : ""}`}
          />
        </button>
        {isFabricOpen && (
          <div className="pb-[20px]">
            <p
              className="text-[14px] leading-[22px] font-normal"
              style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
            >
              100% pure silk with natural breathability and luxurious feel.
            </p>
          </div>
        )}
      </div>

      {/* Sustainability */}
      <div className="flex flex-col border-t border-b border-[#D4C4A8]">
        <button
          onClick={() => setIsSustainabilityOpen(!isSustainabilityOpen)}
          className="flex items-center justify-between py-[20px]"
        >
          <span
            className="text-[16px] leading-[24px] font-medium uppercase tracking-[2px]"
            style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
          >
            SUSTAINABILITY
          </span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${isSustainabilityOpen ? "rotate-180" : ""}`}
          />
        </button>
        {isSustainabilityOpen && (
          <div className="pb-[20px]">
            <p
              className="text-[14px] leading-[22px] font-normal"
              style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
            >
              Ethically sourced materials and sustainable production practices.
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
