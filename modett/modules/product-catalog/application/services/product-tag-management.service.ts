import {
  IProductTagRepository,
  ProductTagQueryOptions,
  ProductTagCountOptions,
} from "../../domain/repositories/product-tag.repository";
import {
  ProductTag,
  ProductTagId,
  CreateProductTagData,
} from "../../domain/entities/product-tag.entity";

export class ProductTagManagementService {
  constructor(private readonly productTagRepository: IProductTagRepository) {}

  // Core CRUD operations
  async createTag(data: CreateProductTagData): Promise<ProductTag> {
    // Validate tag uniqueness
    if (await this.productTagRepository.existsByTag(data.tag)) {
      throw new Error(`Tag "${data.tag}" already exists`);
    }

    // Validate tag format
    this.validateTagFormat(data.tag);

    const tag = ProductTag.create(data);
    await this.productTagRepository.save(tag);

    return tag;
  }

  async getTagById(id: string): Promise<ProductTag> {
    const tagId = ProductTagId.fromString(id);
    const tag = await this.productTagRepository.findById(tagId);

    if (!tag) {
      throw new Error(`Tag with ID "${id}" not found`);
    }

    return tag;
  }

  async getTagByName(tagName: string): Promise<ProductTag> {
    const tag = await this.productTagRepository.findByTag(tagName);

    if (!tag) {
      throw new Error(`Tag "${tagName}" not found`);
    }

    return tag;
  }

  async getAllTags(options?: ProductTagQueryOptions): Promise<{
    tags: ProductTag[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { limit = 20, offset = 0 } = options || {};
    const page = Math.floor(offset / limit) + 1;

    const [tags, total] = await Promise.all([
      this.productTagRepository.findAll(options),
      this.productTagRepository.count(),
    ]);

    return {
      tags,
      total,
      page,
      limit,
    };
  }

  async getTagsByKind(
    kind: string,
    options?: ProductTagQueryOptions
  ): Promise<{
    tags: ProductTag[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { limit = 20, offset = 0 } = options || {};
    const page = Math.floor(offset / limit) + 1;

    const [tags, total] = await Promise.all([
      this.productTagRepository.findByKind(kind, options),
      this.productTagRepository.count({ kind }),
    ]);

    return {
      tags,
      total,
      page,
      limit,
    };
  }

  async updateTag(
    id: string,
    updates: { tag?: string; kind?: string }
  ): Promise<ProductTag> {
    const tag = await this.getTagById(id);

    // Check if new tag name already exists (if changing tag name)
    if (updates.tag && updates.tag !== tag.getTag()) {
      if (await this.productTagRepository.existsByTag(updates.tag)) {
        throw new Error(`Tag "${updates.tag}" already exists`);
      }
      this.validateTagFormat(updates.tag);
      tag.updateTag(updates.tag);
    }

    // Update kind if provided
    if (updates.kind !== undefined) {
      tag.updateKind(updates.kind);
    }

    await this.productTagRepository.update(tag);
    return tag;
  }

  async deleteTag(id: string): Promise<void> {
    const tagId = ProductTagId.fromString(id);

    if (!(await this.productTagRepository.exists(tagId))) {
      throw new Error(`Tag with ID "${id}" not found`);
    }

    await this.productTagRepository.delete(tagId);
  }

  // Search and filtering
  async searchTags(
    query: string,
    options?: ProductTagQueryOptions
  ): Promise<{
    tags: ProductTag[];
    total: number;
    page: number;
    limit: number;
  }> {
    if (!query.trim()) {
      return this.getAllTags(options);
    }

    const { limit = 20, offset = 0 } = options || {};
    const page = Math.floor(offset / limit) + 1;

    // For search, we need to count search results specifically
    const searchQuery = query.trim();
    const [tags, total] = await Promise.all([
      this.productTagRepository.search(searchQuery, options),
      this.productTagRepository
        .search(searchQuery, {
          ...options,
          limit: undefined,
          offset: undefined,
        })
        .then((results) => results.length),
    ]);

    return {
      tags,
      total,
      page,
      limit,
    };
  }

  async getTagSuggestions(
    partialTag: string,
    limit: number = 10
  ): Promise<ProductTag[]> {
    const suggestions = await this.productTagRepository.search(partialTag, {
      limit,
      sortBy: "tag",
      sortOrder: "asc",
    });

    return suggestions;
  }

  // Analytics and statistics
  async getTagStats(): Promise<{
    totalTags: number;
    tagsByKind: Array<{ kind: string | null; count: number }>;
    averageTagLength: number;
  }> {
    // Get total count efficiently
    const totalTags = await this.productTagRepository.count();

    // Get stats with database aggregation
    const stats = await this.productTagRepository.getStatistics();

    return {
      totalTags,
      tagsByKind: stats.tagsByKind,
      averageTagLength: Math.round(stats.averageTagLength * 100) / 100,
    };
  }

  async getMostUsedTags(
    limit: number = 10
  ): Promise<Array<{ tag: ProductTag; usageCount: number }>> {
    const mostUsed = await this.productTagRepository.getMostUsed(limit);
    return mostUsed.map((item) => ({
      tag: item.tag,
      usageCount: item.count,
    }));
  }

  async getUnusedTags(): Promise<ProductTag[]> {
    // This would need to be implemented with product-tag associations
    // For now, returning empty array as placeholder
    return [];
  }

  // Bulk operations
  async createMultipleTags(
    tagData: CreateProductTagData[]
  ): Promise<ProductTag[]> {
    const createdTags: ProductTag[] = [];
    const errors: string[] = [];

    for (const data of tagData) {
      try {
        const tag = await this.createTag(data);
        createdTags.push(tag);
      } catch (error) {
        errors.push(
          `Failed to create tag "${data.tag}": ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    if (errors.length > 0 && createdTags.length === 0) {
      throw new Error(`Failed to create any tags: ${errors.join(", ")}`);
    }

    return createdTags;
  }

  async deleteMultipleTags(
    ids: string[]
  ): Promise<{
    deleted: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    const deleted: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (const id of ids) {
      try {
        await this.deleteTag(id);
        deleted.push(id);
      } catch (error) {
        failed.push({
          id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return { deleted, failed };
  }

  // Validation methods
  async validateTag(tagName: string): Promise<boolean> {
    try {
      this.validateTagFormat(tagName);
      return !(await this.productTagRepository.existsByTag(tagName));
    } catch {
      return false;
    }
  }

  async isTagAvailable(tagName: string): Promise<boolean> {
    return !(await this.productTagRepository.existsByTag(tagName));
  }

  // Utility methods
  async getTagCount(options?: ProductTagCountOptions): Promise<number> {
    return await this.productTagRepository.count(options);
  }

  async normalizeTagName(tagName: string): Promise<string> {
    return tagName.trim().toLowerCase().replace(/\s+/g, "-");
  }

  // Product Tag Association Methods
  async getProductTags(productId: string): Promise<ProductTag[]> {
    return await this.productTagRepository.findByProductId(productId);
  }

  async associateProductTags(
    productId: string,
    tagIds: string[]
  ): Promise<void> {
    // Validate that all tags exist
    for (const tagId of tagIds) {
      const tag = await this.getTagById(tagId);
      if (!tag) {
        throw new Error(`Tag with ID "${tagId}" not found`);
      }
    }

    await this.productTagRepository.associateProductTags(productId, tagIds);
  }

  async removeProductTag(productId: string, tagId: string): Promise<void> {
    // Validate that the association exists
    const exists = await this.productTagRepository.isTagAssociatedWithProduct(
      productId,
      tagId
    );
    if (!exists) {
      throw new Error(`Tag association not found`);
    }

    await this.productTagRepository.removeProductTag(productId, tagId);
  }

  async getTagProducts(
    tagId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<{
    products: any[];
    total: number;
  }> {
    // Validate that tag exists
    await this.getTagById(tagId);

    return await this.productTagRepository.findProductsByTagId(tagId, options);
  }

  // Private validation methods
  private validateTagFormat(tag: string): void {
    if (!tag || tag.trim().length === 0) {
      throw new Error("Tag cannot be empty");
    }

    if (tag.trim().length > 50) {
      throw new Error("Tag cannot be longer than 50 characters");
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(tag)) {
      throw new Error(
        "Tag can only contain letters, numbers, spaces, hyphens, and underscores"
      );
    }
  }
}
