import { useState, useMemo } from "react";

interface Variant {
  id: string;
  size?: string;
  color?: string;
  sku?: string;
  inventory: number;
}

interface UseProductVariantParams {
  variants: Variant[];
}

export function useProductVariant({ variants }: UseProductVariantParams) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const defaultVariant = variants[0];

  const availableSizes = useMemo(() => {
    return Array.from(
      new Set(variants.map((v) => v.size).filter(Boolean))
    ).sort((a, b) => {
      const numA = parseInt(a!);
      const numB = parseInt(b!);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a!.localeCompare(b!);
    });
  }, [variants]);

  const availableColors = useMemo(() => {
    return Array.from(
      new Set(variants.map((v) => v.color).filter(Boolean))
    );
  }, [variants]);

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    const variant = variants.find(
      (v) => v.size === size && (!selectedColor || v.color === selectedColor)
    );
    setSelectedVariant(variant || null);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const variant = variants.find(
      (v) => v.color === color && (!selectedSize || v.size === selectedSize)
    );
    setSelectedVariant(variant || null);
  };

  const getSelectedVariant = () => {
    if (selectedVariant) return selectedVariant;
    if (selectedSize) {
      return variants.find(
        (v) => v.size === selectedSize && (!selectedColor || v.color === selectedColor)
      );
    }
    return null;
  };

  return {
    selectedSize,
    selectedColor,
    selectedVariant: getSelectedVariant(),
    defaultVariant,
    availableSizes,
    availableColors,
    handleSizeSelect,
    handleColorSelect,
    setSelectedVariant,
  };
}
