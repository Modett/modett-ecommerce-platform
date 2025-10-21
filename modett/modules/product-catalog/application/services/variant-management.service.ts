import {
  IProductVariantRepository,
  VariantQueryOptions,
} from "../../domain/repositories/product-variant.repository";
import { IProductRepository } from "../../domain/repositories/product.repository";
import {
  ProductVariant,
  CreateVariantData,
} from "../../domain/entities/product-variant.entity";
import { VariantId } from "../../domain/value-objects/variant-id.vo";
import { ProductId } from "../../domain/value-objects/product-id.vo";
import { SKU } from "../../domain/value-objects/sku.vo";
import { Price } from "../../domain/value-objects/price.vo";

export interface VariantServiceQueryOptions {
  page?: number;
  limit?: number;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "price" | "sku" | "createdAt" | "size" | "color";
  sortOrder?: "asc" | "desc";
}

export interface VariantStatistics {
  totalVariants: number;
  uniqueSizes: string[];
  uniqueColors: string[];
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
  backorderCount: number;
  preorderCount: number;
  outOfStockCount: number;
}

export class VariantManagementService {
  constructor(
    private readonly productVariantRepository: IProductVariantRepository,
    private readonly productRepository: IProductRepository
  ) {}

  async createVariant(
    productId: string,
    data: Omit<CreateVariantData, "productId">
  ): Promise<ProductVariant> {
    // Verify product exists
    const product = await this.productRepository.findById(
      ProductId.fromString(productId)
    );
    if (!product) {
      throw new Error("Product not found");
    }

    // Check if SKU already exists
    if (data.sku) {
      const existingVariant = await this.productVariantRepository.findBySku(
        SKU.fromString(data.sku)
      );
      if (existingVariant) {
        throw new Error("Variant with this SKU already exists");
      }
    }

    // Validate price
    if (data.price <= 0) {
      throw new Error("Price must be positive");
    }

    // Validate compare at price if provided
    if (data.compareAtPrice !== undefined && data.compareAtPrice <= 0) {
      throw new Error("Compare at price must be positive");
    }

    // Validate weight if provided
    if (data.weightG !== undefined && data.weightG < 0) {
      throw new Error("Weight cannot be negative");
    }

    // Validate restock ETA if provided
    if (data.restockEta) {
      const restockDate = new Date(data.restockEta);
      if (isNaN(restockDate.getTime())) {
        throw new Error("Invalid restock ETA date");
      }
    }

    const variantData: CreateVariantData = {
      ...data,
      productId,
    };

    const variant = ProductVariant.create(variantData);
    await this.productVariantRepository.save(variant);
    return variant;
  }

  async getVariantById(id: string): Promise<ProductVariant | null> {
    const variantId = VariantId.fromString(id);
    return await this.productVariantRepository.findById(variantId);
  }

  async getVariantBySku(sku: string): Promise<ProductVariant | null> {
    const skuVo = SKU.fromString(sku);
    return await this.productVariantRepository.findBySku(skuVo);
  }

  async getVariantsByProduct(
    productId: string,
    options: VariantServiceQueryOptions = {}
  ): Promise<ProductVariant[]> {
    const {
      page = 1,
      limit = 20,
      size,
      color,
      minPrice,
      maxPrice,
      inStock,
      sortBy = "price",
      sortOrder = "asc",
    } = options;

    const productIdVo = ProductId.fromString(productId);

    // Get base variants for the product
    let variants =
      await this.productVariantRepository.findByProductId(productIdVo);

    // Apply filters
    if (size) {
      variants = variants.filter((v) => v.getSize() === size);
    }

    if (color) {
      variants = variants.filter((v) => v.getColor() === color);
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      variants = variants.filter((v) => {
        const price = v.getPrice().getValue();
        if (minPrice !== undefined && price < minPrice) return false;
        if (maxPrice !== undefined && price > maxPrice) return false;
        return true;
      });
    }

    // TODO: Implement inStock filtering when inventory is added
    // if (inStock !== undefined) {
    //   variants = variants.filter(v => v.isInStock() === inStock);
    // }

    // Apply sorting
    variants.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "price":
          comparison = a.getPrice().getValue() - b.getPrice().getValue();
          break;
        case "sku":
          comparison = a
            .getSku()
            .getValue()
            .localeCompare(b.getSku().getValue());
          break;
        case "size":
          const sizeA = a.getSize() || "";
          const sizeB = b.getSize() || "";
          comparison = sizeA.localeCompare(sizeB);
          break;
        case "color":
          const colorA = a.getColor() || "";
          const colorB = b.getColor() || "";
          comparison = colorA.localeCompare(colorB);
          break;
        case "createdAt":
          comparison = a.getCreatedAt().getTime() - b.getCreatedAt().getTime();
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    return variants.slice(startIndex, startIndex + limit);
  }

  async getAllVariants(
    options: VariantServiceQueryOptions = {}
  ): Promise<ProductVariant[]> {
    const {
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const repositoryOptions: VariantQueryOptions = {
      limit,
      offset: (page - 1) * limit,
      sortBy: sortBy === "color" || sortBy === "size" ? "sku" : sortBy,
      sortOrder,
    };

    return await this.productVariantRepository.findAll(repositoryOptions);
  }

  async getVariantsByPriceRange(
    minPrice: number,
    maxPrice: number,
    options: VariantServiceQueryOptions = {}
  ): Promise<ProductVariant[]> {
    const {
      page = 1,
      limit = 20,
      sortBy = "price",
      sortOrder = "asc",
    } = options;

    const repositoryOptions: VariantQueryOptions = {
      limit,
      offset: (page - 1) * limit,
      sortBy: sortBy === "color" || sortBy === "size" ? "price" : sortBy,
      sortOrder,
    };

    return await this.productVariantRepository.findByPriceRange(
      minPrice,
      maxPrice,
      repositoryOptions
    );
  }

  async getVariantsBySize(
    size: string,
    options: VariantServiceQueryOptions = {}
  ): Promise<ProductVariant[]> {
    const {
      page = 1,
      limit = 20,
      sortBy = "price",
      sortOrder = "asc",
    } = options;

    const repositoryOptions: VariantQueryOptions = {
      limit,
      offset: (page - 1) * limit,
      sortBy: sortBy === "color" || sortBy === "size" ? "price" : sortBy,
      sortOrder,
    };

    return await this.productVariantRepository.findBySize(
      size,
      repositoryOptions
    );
  }

  async getVariantsByColor(
    color: string,
    options: VariantServiceQueryOptions = {}
  ): Promise<ProductVariant[]> {
    const {
      page = 1,
      limit = 20,
      sortBy = "price",
      sortOrder = "asc",
    } = options;

    const repositoryOptions: VariantQueryOptions = {
      limit,
      offset: (page - 1) * limit,
      sortBy: sortBy === "color" || sortBy === "size" ? "price" : sortBy,
      sortOrder,
    };

    return await this.productVariantRepository.findByColor(
      color,
      repositoryOptions
    );
  }

  async updateVariant(
    id: string,
    updateData: Partial<CreateVariantData>
  ): Promise<ProductVariant | null> {
    const variantId = VariantId.fromString(id);
    const variant = await this.productVariantRepository.findById(variantId);

    if (!variant) {
      throw new Error("Variant not found");
    }

    // Update SKU if provided
    if (updateData.sku !== undefined) {
      const newSku = SKU.fromString(updateData.sku);
      // Check if new SKU already exists (excluding current variant)
      const existingVariant =
        await this.productVariantRepository.findBySku(newSku);
      if (existingVariant && !existingVariant.getId().equals(variantId)) {
        throw new Error("Variant with this SKU already exists");
      }
      variant.updateSku(updateData.sku);
    }

    // Update price if provided
    if (updateData.price !== undefined) {
      if (updateData.price <= 0) {
        throw new Error("Price must be positive");
      }
      variant.updatePrice(updateData.price);
    }

    // Update compare at price if provided
    if (updateData.compareAtPrice !== undefined) {
      if (updateData.compareAtPrice <= 0) {
        throw new Error("Compare at price must be positive");
      }
      variant.updateCompareAtPrice(updateData.compareAtPrice);
    }

    // Update size if provided
    if (updateData.size !== undefined) {
      variant.updateSize(updateData.size);
    }

    // Update color if provided
    if (updateData.color !== undefined) {
      variant.updateColor(updateData.color);
    }

    // Update barcode if provided
    if (updateData.barcode !== undefined) {
      variant.updateBarcode(updateData.barcode);
    }

    // Update weight if provided
    if (updateData.weightG !== undefined) {
      if (updateData.weightG < 0) {
        throw new Error("Weight cannot be negative");
      }
      variant.updateWeight(updateData.weightG);
    }

    // Update dimensions if provided
    if (updateData.dims !== undefined) {
      variant.updateDimensions(updateData.dims);
    }

    // Update tax class if provided
    if (updateData.taxClass !== undefined) {
      variant.updateTaxClass(updateData.taxClass);
    }

    // Update backorder settings if provided
    if (updateData.allowBackorder !== undefined) {
      variant.setBackorderPolicy(updateData.allowBackorder);
    }

    // Update preorder settings if provided
    if (updateData.allowPreorder !== undefined) {
      variant.setPreorderPolicy(updateData.allowPreorder);
    }

    // Update restock ETA if provided
    if (updateData.restockEta !== undefined) {
      if (updateData.restockEta) {
        const restockDate = new Date(updateData.restockEta);
        if (isNaN(restockDate.getTime())) {
          throw new Error("Invalid restock ETA date");
        }
      }
      variant.setRestockEta(updateData.restockEta);
    }

    await this.productVariantRepository.update(variant);
    return variant;
  }

  async deleteVariant(id: string): Promise<boolean> {
    const variantId = VariantId.fromString(id);
    const variant = await this.productVariantRepository.findById(variantId);

    if (!variant) {
      return false;
    }

    await this.productVariantRepository.delete(variantId);
    return true;
  }

  async deleteVariantsByProduct(productId: string): Promise<void> {
    const productIdVo = ProductId.fromString(productId);
    await this.productVariantRepository.deleteByProductId(productIdVo);
  }

  async getVariantStatistics(productId?: string): Promise<VariantStatistics> {
    let variants: ProductVariant[];

    if (productId) {
      const productIdVo = ProductId.fromString(productId);
      variants =
        await this.productVariantRepository.findByProductId(productIdVo);
    } else {
      variants = await this.productVariantRepository.findAll();
    }

    const sizes = new Set<string>();
    const colors = new Set<string>();
    const prices: number[] = [];
    let backorderCount = 0;
    let preorderCount = 0;
    let outOfStockCount = 0;

    for (const variant of variants) {
      // Collect unique sizes and colors
      if (variant.getSize()) sizes.add(variant.getSize()!);
      if (variant.getColor()) colors.add(variant.getColor()!);

      // Collect prices
      prices.push(variant.getPrice().getValue());

      // Count special types
      if (variant.getAllowBackorder()) backorderCount++;
      if (variant.getAllowPreorder()) preorderCount++;
      // TODO: Implement out of stock counting when inventory is added
    }

    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
      average:
        prices.length > 0
          ? prices.reduce((sum, price) => sum + price, 0) / prices.length
          : 0,
    };

    return {
      totalVariants: variants.length,
      uniqueSizes: Array.from(sizes).sort(),
      uniqueColors: Array.from(colors).sort(),
      priceRange,
      backorderCount,
      preorderCount,
      outOfStockCount,
    };
  }

  async getBackorderVariants(): Promise<ProductVariant[]> {
    return await this.productVariantRepository.findAvailableForBackorder();
  }

  async getPreorderVariants(): Promise<ProductVariant[]> {
    return await this.productVariantRepository.findAvailableForPreorder();
  }

  async duplicateVariant(id: string, newSku: string): Promise<ProductVariant> {
    const variantId = VariantId.fromString(id);
    const originalVariant =
      await this.productVariantRepository.findById(variantId);

    if (!originalVariant) {
      throw new Error("Original variant not found");
    }

    // Check if new SKU already exists
    const existingVariant = await this.productVariantRepository.findBySku(
      SKU.fromString(newSku)
    );
    if (existingVariant) {
      throw new Error("Variant with this SKU already exists");
    }

    const duplicateData: CreateVariantData = {
      productId: originalVariant.getProductId().getValue(),
      sku: newSku,
      size: originalVariant.getSize() || undefined,
      color: originalVariant.getColor() || undefined,
      barcode: originalVariant.getBarcode() || undefined,
      price: originalVariant.getPrice().getValue(),
      compareAtPrice:
        originalVariant.getCompareAtPrice()?.getValue() || undefined,
      weightG: originalVariant.getWeightG() || undefined,
      dims: originalVariant.getDims() || undefined,
      taxClass: originalVariant.getTaxClass() || undefined,
      allowBackorder: originalVariant.getAllowBackorder(),
      allowPreorder: originalVariant.getAllowPreorder(),
      restockEta: originalVariant.getRestockEta() || undefined,
    };

    const newVariant = ProductVariant.create(duplicateData);
    await this.productVariantRepository.save(newVariant);
    return newVariant;
  }

  async validateVariant(id: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const variantId = VariantId.fromString(id);
    const variant = await this.productVariantRepository.findById(variantId);

    if (!variant) {
      return {
        isValid: false,
        issues: ["Variant not found"],
      };
    }

    const issues: string[] = [];

    // Check if SKU exists
    if (!variant.getSku().getValue()) {
      issues.push("Missing SKU");
    }

    // Check if price is positive
    if (variant.getPrice().getValue() <= 0) {
      issues.push("Price must be positive");
    }

    // Check compare at price
    const compareAtPrice = variant.getCompareAtPrice();
    if (
      compareAtPrice &&
      compareAtPrice.getValue() <= variant.getPrice().getValue()
    ) {
      issues.push("Compare at price should be higher than regular price");
    }

    // Check weight
    const weight = variant.getWeightG();
    if (weight !== null && weight < 0) {
      issues.push("Weight cannot be negative");
    }

    // Check product exists
    const productExists = await this.productRepository.exists(
      variant.getProductId()
    );
    if (!productExists) {
      issues.push("Associated product not found");
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }
}
