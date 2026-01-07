"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ChevronDown } from "lucide-react";
import { getColorHex } from "@/lib/colors";
import { useAddToCart } from "@/features/cart/queries";
import {
  useProductWishlist,
  useProductVariant,
} from "@/features/product-catalog/hooks";
import { useTrackAddToCart } from "@/features/analytics/hooks";
import { toast } from "sonner";
import { TEXT_STYLES, PRODUCT_CLASSES } from "@/features/cart/constants/styles";

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
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [isFabricOpen, setIsFabricOpen] = useState(false);
  const [isSustainabilityOpen, setIsSustainabilityOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addToCartMutation = useAddToCart();
  const trackAddToCart = useTrackAddToCart();

  const variantIds = product.variants?.map((v) => v.id) || [];

  const { isWishlisted, isTogglingWishlist, toggleWishlist } =
    useProductWishlist({
      productId: product.id,
      variantIds,
      productTitle: product.title,
    });

  const {
    selectedSize,
    selectedColor,
    selectedVariant,
    defaultVariant,
    availableSizes,
    availableColors,
    handleSizeSelect,
    handleColorSelect,
  } = useProductVariant({ variants: product.variants || [] });

  const effectiveColor = selectedColor || availableColors[0];

  const getVariantForSize = (size: string) => {
    return product.variants?.find(
      (v) => v.size === size && v.color === effectiveColor
    );
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (!selectedVariant) {
      toast.error("Selected variant not available");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCartMutation.mutateAsync({
        variantId: selectedVariant.id,
        quantity: 1,
      });

      toast.success(`${product.title} added to cart!`);

      // Track add to cart event
      trackAddToCart(product.id, selectedVariant.id, 1, product.price);
    } catch (error: any) {
      // Customize error messages
      let errorMessage = error.message;

      if (errorMessage === "Failed to add item to cart") {
        errorMessage =
          "We apologize, but we are unable to add this item to the cart right now. Please try again or contact support if the issue persists.";
      } else if (errorMessage.toLowerCase().includes("inventory")) {
        errorMessage =
          "This item is currently out of stock. Please select a different size or color.";
      }

      toast.error(errorMessage);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = () => {
    if (!defaultVariant) {
      toast.error("Product variant not available");
      return;
    }
    toggleWishlist(defaultVariant.id);
  };

  return (
    <div className="flex flex-col gap-[10px] w-full max-w-[350px] md:max-w-none md:w-[300px] pt-[16px] md:pt-0 shrink-0 pr-[1px] md:sticky md:top-0 md:self-start">
      {/* Product Title */}
      <div className="flex flex-row justify-between items-start w-full max-w-full px-[15px] md:px-0 md:max-w-[300px] md:flex-col md:gap-[7px]">
        <h1
          className="text-[18px] leading-[28px] font-normal tracking-normal text-[#232D35]"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          {product.title}
        </h1>
        <span
          className="text-[12px] leading-[28px] font-normal text-[#232D35]/60 md:hidden"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          Easy Fit
        </span>
      </div>

      {/* Color Selection */}
      <div className="flex flex-col gap-[10px] w-full max-w-full md:max-w-none md:w-full h-[81px] md:h-auto justify-center px-[13px] md:py-[10px] border-t border-b border-[#E5E0D6]">
        <p
          className="text-[13px] font-medium uppercase tracking-[2px]"
          style={TEXT_STYLES.bodyGraphite}
        >
          COLOUR: {selectedColor || availableColors[0] || ""}
        </p>
        {availableColors.length > 0 && (
          <div className="flex items-center gap-[13px]">
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color!)}
                className={`w-[20px] h-[20px] rounded-full transition-all ${
                  selectedColor === color ||
                  (!selectedColor && color === availableColors[0])
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
      <div className="flex flex-col gap-[10px] w-full max-w-full md:max-w-none md:w-full px-[13px] pt-[9px]">
        <div className="flex items-center justify-between w-full h-[40px]">
          <p
            className="text-[17px] font-normal text-[#232D35]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Size: {selectedSize || "38"}
          </p>
          <button
            className="text-[13px] font-normal text-[#232D35]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Fit Chart
          </button>
        </div>
        <div className="flex flex-wrap justify-between gap-y-4 w-full">
          {availableSizes.map((size) => {
            const variantForSize = getVariantForSize(size!);
            const isOutOfStock = (variantForSize?.inventory || 0) <= 0;

            return (
              <button
                key={size}
                disabled={isOutOfStock}
                onClick={() => handleSizeSelect(size!)}
                className={`w-[46px] h-[36px] md:w-auto md:min-w-[24px] md:h-[30px] flex items-center justify-center transition-all relative ${
                  selectedSize === size
                    ? "font-semibold text-[#232D35] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#232D35]"
                    : "font-normal text-[#232D35]/70 hover:text-[#232D35]"
                } ${isOutOfStock ? "opacity-30 cursor-not-allowed decoration-slice line-through" : ""}`}
                style={{
                  fontFamily: "Raleway, sans-serif",
                  fontSize: "14px",
                  lineHeight: "24px",
                  letterSpacing: "2px",
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add to Cart & Wishlist */}
      <div className="flex w-full max-w-full md:max-w-[290px] lg:max-w-[300px] pt-[16px] md:pt-[15px] lg:pt-[16px] gap-[1px]">
        <Button
          onClick={handleAddToCart}
          disabled={
            isAddingToCart ||
            (selectedVariant ? selectedVariant.inventory <= 0 : false)
          }
          className={`flex-1 max-w-full md:max-w-[245px] lg:max-w-[254px] h-[46px] md:h-[48px] lg:h-[50px] ${PRODUCT_CLASSES.addToCartButton} text-[15px] md:text-[15.5px] lg:text-[16px] border border-[#232D35] pt-[14px] md:pt-[14.5px] lg:pt-[15.5px] pr-[28px] md:pr-[29px] lg:pr-[31px] pb-[15px] md:pb-[15.5px] lg:pb-[16.5px] pl-[28px] md:pl-[29px] lg:pl-[31px] disabled:opacity-50 disabled:cursor-not-allowed`}
          style={TEXT_STYLES.button}
        >
          {isAddingToCart
            ? "ADDING..."
            : selectedVariant && selectedVariant.inventory <= 0
              ? "OUT OF STOCK"
              : "ADD TO CART"}
        </Button>
        <Button
          onClick={handleWishlist}
          disabled={isTogglingWishlist}
          variant="outline"
          className="h-[46px] md:h-[48px] lg:h-[50px] w-[42px] md:w-[44px] lg:w-[46px] flex-shrink-0 bg-[#232D35] border-[#232D35] text-white hover:bg-white hover:text-[#232D35] transition-all rounded-none p-0 pl-[1px] disabled:opacity-50"
        >
          <Heart
            className={`w-[18px] md:w-[19px] lg:w-5 h-[18px] md:h-[19px] lg:h-5 transition-all ${isWishlisted ? "fill-white" : ""} ${isTogglingWishlist ? "animate-pulse" : ""}`}
            strokeWidth={2}
          />
        </Button>
      </div>

      {/* Product Description */}
      <div className="flex flex-col gap-[8px] md:gap-[16px] w-full md:w-full max-w-full pt-[40px] md:pt-[24px] lg:pt-[32px] overflow-y-auto md:overflow-visible h-[373px] md:h-auto">
        <button
          onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
          className="hidden md:flex items-center justify-between py-[18px] md:py-[19px] lg:py-[20px]"
        >
          <span
            className="text-[15px] md:text-[15.5px] lg:text-[16px] leading-[23px] md:leading-[23.5px] lg:leading-[24px] font-medium uppercase tracking-[1.8px] md:tracking-[1.9px] lg:tracking-[2px]"
            style={TEXT_STYLES.bodyGraphite}
          >
            DESCRIPTION
          </span>
          <ChevronDown
            className={`w-[18px] md:w-[19px] lg:w-5 h-[18px] md:h-[19px] lg:h-5 transition-transform ${isDescriptionOpen ? "rotate-180" : ""}`}
          />
        </button>
        <div
          className={`pb-[18px] md:pb-[19px] lg:pb-[20px] ${isDescriptionOpen ? "" : "md:hidden"}`}
        >
          <p
            className="text-[13px] md:text-[13.5px] lg:text-[14px] leading-[20px] md:leading-[21px] lg:leading-[22px] font-normal"
            style={TEXT_STYLES.bodyGraphite}
          >
            {product.description ||
              "Crafted from 100% pure, natural silk with a refined drape. This classic shirt embodies quiet luxury with short sleeves for everyday luxury. Its advanced cut structure includes front-button details and a versatile composition. Designed to move effortlessly from day to night while maintaining a timeless elegance that defies of trend-compliance. Its a modern, contemporary elegance, making it a timeless cornerstone for the modern wardrobe."}
          </p>
        </div>
      </div>

      {/* Collapsible Sections Container */}
      <div className="w-full md:w-full md:max-w-[290px] lg:max-w-[300px] min-h-[210px] h-auto overflow-visible">
        {/* Design */}
        <div className="flex flex-col border-t border-b border-[#E5E0D6]">
          <button
            onClick={() => setIsDesignOpen(!isDesignOpen)}
            className="flex items-center justify-between h-[70px] md:h-auto md:py-[19px] lg:py-[20px]"
          >
            <span
              className="text-[15px] md:text-[15.5px] lg:text-[16px] leading-[23px] md:leading-[23.5px] lg:leading-[24px] font-medium uppercase tracking-[1.8px] md:tracking-[1.9px] lg:tracking-[2px]"
              style={TEXT_STYLES.bodyGraphite}
            >
              DESIGN
            </span>
            <ChevronDown
              className={`w-[18px] md:w-[19px] lg:w-5 h-[18px] md:h-[19px] lg:h-5 transition-transform ${isDesignOpen ? "rotate-180" : ""}`}
            />
          </button>
          {isDesignOpen && (
            <div className="pb-[18px] md:pb-[19px] lg:pb-[20px]">
              <p
                className="text-[13px] md:text-[13.5px] lg:text-[14px] leading-[20px] md:leading-[21px] lg:leading-[22px] font-normal"
                style={TEXT_STYLES.bodyGraphite}
              >
                Classic shirt design with modern silhouette and refined details.
              </p>
            </div>
          )}
        </div>

        {/* Fabric */}
        <div className="flex flex-col border-b border-[#E5E0D6]">
          <button
            onClick={() => setIsFabricOpen(!isFabricOpen)}
            className="flex items-center justify-between h-[70px] md:h-auto md:py-[19px] lg:py-[20px]"
          >
            <span
              className="text-[15px] md:text-[15.5px] lg:text-[16px] leading-[23px] md:leading-[23.5px] lg:leading-[24px] font-medium uppercase tracking-[1.8px] md:tracking-[1.9px] lg:tracking-[2px]"
              style={TEXT_STYLES.bodyGraphite}
            >
              FABRIC
            </span>
            <ChevronDown
              className={`w-[18px] md:w-[19px] lg:w-5 h-[18px] md:h-[19px] lg:h-5 transition-transform ${isFabricOpen ? "rotate-180" : ""}`}
            />
          </button>
          {isFabricOpen && (
            <div className="pb-[18px] md:pb-[19px] lg:pb-[20px]">
              <p
                className="text-[13px] md:text-[13.5px] lg:text-[14px] leading-[20px] md:leading-[21px] lg:leading-[22px] font-normal"
                style={TEXT_STYLES.bodyGraphite}
              >
                100% pure silk with natural breathability and luxurious feel.
              </p>
            </div>
          )}
        </div>

        {/* Sustainability */}
        <div className="flex flex-col border-b border-[#E5E0D6]">
          <button
            onClick={() => setIsSustainabilityOpen(!isSustainabilityOpen)}
            className="flex items-center justify-between h-[70px] md:h-auto md:py-[19px] lg:py-[20px]"
          >
            <span
              className="text-[15px] md:text-[15.5px] lg:text-[16px] leading-[23px] md:leading-[23.5px] lg:leading-[24px] font-medium uppercase tracking-[1.8px] md:tracking-[1.9px] lg:tracking-[2px]"
              style={TEXT_STYLES.bodyGraphite}
            >
              SUSTAINABILITY
            </span>
            <ChevronDown
              className={`w-[18px] md:w-[19px] lg:w-5 h-[18px] md:h-[19px] lg:h-5 transition-transform ${isSustainabilityOpen ? "rotate-180" : ""}`}
            />
          </button>
          {isSustainabilityOpen && (
            <div className="pb-[18px] md:pb-[19px] lg:pb-[20px]">
              <p
                className="text-[13px] md:text-[13.5px] lg:text-[14px] leading-[20px] md:leading-[21px] lg:leading-[22px] font-normal"
                style={TEXT_STYLES.bodyGraphite}
              >
                Ethically sourced materials and sustainable production
                practices.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
