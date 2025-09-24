import { IProductTagRepository, ProductTagQueryOptions, ProductTagCountOptions } from '../../domain/repositories/product-tag.repository';
import { ProductTag, ProductTagId, CreateProductTagData } from '../../domain/entities/product-tag.entity';

export class ProductTagManagementService {
  constructor(
    private readonly productTagRepository: IProductTagRepository
  ) {}

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

  async getAllTags(options?: ProductTagQueryOptions): Promise<ProductTag[]> {
    return await this.productTagRepository.findAll(options);
  }

  async getTagsByKind(kind: string, options?: ProductTagQueryOptions): Promise<ProductTag[]> {
    return await this.productTagRepository.findByKind(kind, options);
  }

  async updateTag(id: string, updates: { tag?: string; kind?: string }): Promise<ProductTag> {
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
  async searchTags(query: string, options?: ProductTagQueryOptions): Promise<ProductTag[]> {
    if (!query.trim()) {
      return this.getAllTags(options);
    }

    return await this.productTagRepository.search(query.trim(), options);
  }

  async getTagSuggestions(partialTag: string, limit: number = 10): Promise<ProductTag[]> {
    const suggestions = await this.productTagRepository.search(partialTag, {
      limit,
      sortBy: 'tag',
      sortOrder: 'asc',
    });

    return suggestions;
  }

  // Analytics and statistics
  async getTagStats(): Promise<{
    totalTags: number;
    tagsByKind: Array<{ kind: string | null; count: number }>;
    averageTagLength: number;
  }> {
    const totalTags = await this.productTagRepository.count();
    const allTags = await this.productTagRepository.findAll();

    // Group by kind
    const kindGroups = new Map<string | null, number>();
    let totalTagLength = 0;

    for (const tag of allTags) {
      const kind = tag.getKind();
      kindGroups.set(kind, (kindGroups.get(kind) || 0) + 1);
      totalTagLength += tag.getTag().length;
    }

    const tagsByKind = Array.from(kindGroups.entries()).map(([kind, count]) => ({
      kind,
      count,
    }));

    const averageTagLength = totalTags > 0 ? totalTagLength / totalTags : 0;

    return {
      totalTags,
      tagsByKind,
      averageTagLength: Math.round(averageTagLength * 100) / 100,
    };
  }

  async getMostUsedTags(limit: number = 10): Promise<Array<{ tag: ProductTag; usageCount: number }>> {
    const mostUsed = await this.productTagRepository.getMostUsed(limit);
    return mostUsed.map(item => ({
      tag: item.tag,
      usageCount: item.count
    }));
  }

  async getUnusedTags(): Promise<ProductTag[]> {
    // This would need to be implemented with product-tag associations
    // For now, returning empty array as placeholder
    return [];
  }

  // Bulk operations
  async createMultipleTags(tagData: CreateProductTagData[]): Promise<ProductTag[]> {
    const createdTags: ProductTag[] = [];
    const errors: string[] = [];

    for (const data of tagData) {
      try {
        const tag = await this.createTag(data);
        createdTags.push(tag);
      } catch (error) {
        errors.push(`Failed to create tag "${data.tag}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (errors.length > 0 && createdTags.length === 0) {
      throw new Error(`Failed to create any tags: ${errors.join(', ')}`);
    }

    return createdTags;
  }

  async deleteMultipleTags(ids: string[]): Promise<{ deleted: string[]; failed: Array<{ id: string; error: string }> }> {
    const deleted: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (const id of ids) {
      try {
        await this.deleteTag(id);
        deleted.push(id);
      } catch (error) {
        failed.push({
          id,
          error: error instanceof Error ? error.message : 'Unknown error',
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
    return tagName.trim().toLowerCase().replace(/\s+/g, '-');
  }

  // Private validation methods
  private validateTagFormat(tag: string): void {
    if (!tag || tag.trim().length === 0) {
      throw new Error('Tag cannot be empty');
    }

    if (tag.trim().length > 50) {
      throw new Error('Tag cannot be longer than 50 characters');
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(tag)) {
      throw new Error('Tag can only contain letters, numbers, spaces, hyphens, and underscores');
    }
  }
}