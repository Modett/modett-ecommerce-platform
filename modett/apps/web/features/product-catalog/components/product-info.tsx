"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ChevronDown } from "lucide-react";
import { getColorHex } from "@/lib/colors";

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
    <div className="flex flex-col gap-[10px] w-[300px] pr-[1px] pt-[10px] sticky top-0">
      {/* Product Title */}
      <div className="flex flex-col gap-[9px] max-w-[330px]">
        <h1
          className="text-[18px] leading-[28px] font-normal"
          style={{ fontFamily: "Raleway, sans-serif", color: "#232D35", letterSpacing: "0%" }}
        >
          {product.title}
        </h1>
      </div>

      {/* Color Selection */}
      <div className="flex flex-col gap-[12px] w-[299px] h-[81px] px-[15px] py-[10px] border-t border-b border-[#E5E0D6]">
        <p
          className="text-[14px] leading-[20px] font-medium uppercase tracking-[2px]"
          style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
        >
          COLOUR: {selectedColor || colors[0] || ""}
        </p>
        {colors.length > 0 && (
          <div className="flex items-center gap-[12px]">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color!)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColor === color ||
                  (!selectedColor && color === colors[0])
                    ? "border-[#232D35] ring-2 ring-offset-2 ring-[#232D35]"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                style={{ backgroundColor: getColorHex(color) }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Size Selection */}
      <div className="flex flex-col gap-[12px] w-[299px] max-w-[330px] px-[15px] pt-[10px]">
        <div className="flex items-center justify-between w-[269px] h-[40px]">
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
        <div className="grid grid-cols-5 gap-[8px] w-[269px] h-[80px]">
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
        <p
          className="text-[12px] leading-[16px] font-normal w-[269px] h-[40px] flex items-center"
          style={{ fontFamily: "Raleway, sans-serif", color: "#6B7B8A" }}
        >
          Model is 5'9" and wears a size 38
        </p>
      </div>

      {/* Add to Cart & Wishlist */}
      <div className="flex w-[300px] pt-[16px] gap-[1px]">
        <Button
          className="w-[254px] h-[50px] bg-[#232D35] text-white hover:bg-[#232D35]/90 rounded-none text-[16px] font-medium uppercase tracking-[4px] border border-[#232D35] pt-[15.5px] pr-[31px] pb-[16.5px] pl-[31px]"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          ADD TO CART
        </Button>
        <Button
          variant="outline"
          className="h-[50px] w-[46px] bg-[#232D35] border-[#232D35] text-white hover:bg-white hover:text-[#232D35] transition-all rounded-none p-0 pl-[1px]"
        >
          <Heart className="w-5 h-5" strokeWidth={2} />
        </Button>
      </div>

      {/* Product Description */}
      <div className="flex flex-col w-[300px] h-[373px] pt-[40px] gap-[8px]">
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
      <div className="w-[300px] h-[210px] overflow-hidden">
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
