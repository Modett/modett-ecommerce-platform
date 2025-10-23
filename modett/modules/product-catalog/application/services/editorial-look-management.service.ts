import {
  IEditorialLookRepository,
  EditorialLookQueryOptions,
  EditorialLookCountOptions,
} from "../../domain/repositories/editorial-look.repository";
import { IMediaAssetRepository } from "../../domain/repositories/media-asset.repository";
import { IProductRepository } from "../../domain/repositories/product.repository";
import {
  EditorialLook,
  CreateEditorialLookData,
} from "../../domain/entities/editorial-look.entity";
import { EditorialLookId as EntityEditorialLookId } from "../../domain/entities/editorial-look.entity";
import { MediaAssetId as EntityMediaAssetId } from "../../domain/entities/media-asset.entity";
import { EditorialLookId } from "../../domain/value-objects/editorial-look-id.vo";
import { ProductId } from "../../domain/value-objects/product-id.vo";

export class EditorialLookManagementService {
  constructor(
    private readonly editorialLookRepository: IEditorialLookRepository,
    private readonly mediaAssetRepository: IMediaAssetRepository,
    private readonly productRepository: IProductRepository
  ) {}

  // Core CRUD operations
  async createEditorialLook(
    data: CreateEditorialLookData
  ): Promise<EditorialLook> {
    this.validateTitle(data.title);

    if (data.storyHtml) {
      this.validateHtmlContent(data.storyHtml);
    }

    // Allow any publishedAt date (past, present, future)

    // Validate hero asset exists if provided
    if (data.heroAssetId) {
      const heroAssetIdEntity = EntityMediaAssetId.fromString(data.heroAssetId);
      const heroAsset =
        await this.mediaAssetRepository.findById(heroAssetIdEntity);
      if (!heroAsset) {
        throw new Error(`Hero asset with ID "${data.heroAssetId}" not found`);
      }

      // Validate it's an image
      if (!heroAsset.isImage()) {
        throw new Error("Hero asset must be an image");
      }
    }

    // Validate all product IDs exist if provided
    if (data.productIds && data.productIds.length > 0) {
      for (const productId of data.productIds) {
        const productIdVo = ProductId.fromString(productId);
        const product = await this.productRepository.findById(productIdVo);
        if (!product) {
          throw new Error(`Product with ID "${productId}" not found`);
        }
      }
    }

    const look = EditorialLook.create(data);

    try {
      await this.editorialLookRepository.save(look);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("duplicate") &&
        error.message.includes("title")
      ) {
        throw new Error(
          `Editorial look with title "${data.title}" already exists`
        );
      }
      throw error;
    }

    return look;
  }

  async getEditorialLookById(id: string): Promise<EditorialLook> {
    const lookId = EntityEditorialLookId.fromString(id);
    const look = await this.editorialLookRepository.findById(lookId);

    if (!look) {
      throw new Error(`Editorial look with ID "${id}" not found`);
    }

    return look;
  }

  async getAllEditorialLooks(
    options?: EditorialLookQueryOptions
  ): Promise<EditorialLook[]> {
    return await this.editorialLookRepository.findAll(options);
  }

  async getPublishedLooks(
    options?: EditorialLookQueryOptions
  ): Promise<EditorialLook[]> {
    return await this.editorialLookRepository.findPublished(options);
  }

  async getScheduledLooks(
    options?: EditorialLookQueryOptions
  ): Promise<EditorialLook[]> {
    return await this.editorialLookRepository.findScheduled(options);
  }

  async getDraftLooks(
    options?: EditorialLookQueryOptions
  ): Promise<EditorialLook[]> {
    return await this.editorialLookRepository.findDrafts(options);
  }

  async updateEditorialLook(
    id: string,
    updates: {
      title?: string;
      storyHtml?: string | null;
      heroAssetId?: string | null;
      publishedAt?: Date | null;
    }
  ): Promise<EditorialLook> {
    const look = await this.getEditorialLookById(id);

    if (updates.title !== undefined) {
      this.validateTitle(updates.title);
      look.updateTitle(updates.title);
    }

    if (updates.storyHtml !== undefined) {
      if (updates.storyHtml) {
        this.validateHtmlContent(updates.storyHtml);
      }
      look.updateStoryHtml(updates.storyHtml);
    }

    if (updates.heroAssetId !== undefined) {
      if (updates.heroAssetId !== null) {
        // Validate hero asset exists
        const heroAssetIdEntity = EntityMediaAssetId.fromString(
          updates.heroAssetId
        );
        const heroAsset =
          await this.mediaAssetRepository.findById(heroAssetIdEntity);
        if (!heroAsset) {
          throw new Error(
            `Hero asset with ID "${updates.heroAssetId}" not found`
          );
        }

        // Validate it's an image
        if (!heroAsset.isImage()) {
          throw new Error("Hero asset must be an image");
        }
      }
      look.setHeroAsset(updates.heroAssetId);
    }

    if (updates.publishedAt !== undefined) {
      if (updates.publishedAt) {
        // Only enforce future date if look is not already published
        if (!look.isPublished() && updates.publishedAt <= new Date()) {
          throw new Error(
            "Publication date must be in the future for scheduled publication"
          );
        }
        look.schedulePublication(updates.publishedAt);
      } else {
        look.unpublish();
      }
    }

    await this.editorialLookRepository.update(look);
    return look;
  }

  async deleteEditorialLook(id: string): Promise<void> {
    const lookId = EntityEditorialLookId.fromString(id);

    if (!(await this.editorialLookRepository.exists(lookId))) {
      throw new Error(`Editorial look with ID "${id}" not found`);
    }

    await this.editorialLookRepository.delete(lookId);
  }

  // Publishing workflow
  async publishLook(id: string): Promise<EditorialLook> {
    const look = await this.getEditorialLookById(id);

    if (!look.canBePublished()) {
      throw new Error(
        "Editorial look cannot be published: missing title or hero image"
      );
    }

    look.publish();
    await this.editorialLookRepository.update(look);

    return look;
  }

  async unpublishLook(id: string): Promise<EditorialLook> {
    const look = await this.getEditorialLookById(id);
    look.unpublish();
    await this.editorialLookRepository.update(look);

    return look;
  }

  async scheduleLookPublication(
    id: string,
    publishDate: Date
  ): Promise<EditorialLook> {
    if (publishDate <= new Date()) {
      throw new Error("Publication date must be in the future");
    }

    const look = await this.getEditorialLookById(id);

    if (!look.canBePublished()) {
      throw new Error(
        "Editorial look cannot be scheduled: missing title or hero image"
      );
    }

    look.schedulePublication(publishDate);
    await this.editorialLookRepository.update(look);

    return look;
  }

  async getReadyToPublishLooks(): Promise<EditorialLook[]> {
    return await this.editorialLookRepository.findReadyToPublish();
  }

  async processScheduledPublications(): Promise<{
    published: EditorialLook[];
    errors: string[];
  }> {
    const readyLooks = await this.getReadyToPublishLooks();
    const published: EditorialLook[] = [];
    const errors: string[] = [];

    for (const look of readyLooks) {
      try {
        if (look.canBePublished()) {
          // Publish the look (this will set publishedAt to now if it's not already published)
          look.publish();
          await this.editorialLookRepository.update(look);
          published.push(look);
        }
      } catch (error) {
        errors.push(
          `Failed to publish look ${look.getId().getValue()}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return { published, errors };
  }

  // Hero image management
  async setHeroImage(id: string, assetId: string): Promise<EditorialLook> {
    const look = await this.getEditorialLookById(id);

    // Validate hero asset exists
    const heroAssetIdEntity = EntityMediaAssetId.fromString(assetId);
    const heroAsset =
      await this.mediaAssetRepository.findById(heroAssetIdEntity);
    if (!heroAsset) {
      throw new Error(`Hero asset with ID "${assetId}" not found`);
    }

    // Validate it's an image
    if (!heroAsset.isImage()) {
      throw new Error("Hero asset must be an image");
    }

    look.setHeroAsset(assetId);
    await this.editorialLookRepository.update(look);

    return look;
  }

  async removeHeroImage(id: string): Promise<EditorialLook> {
    const look = await this.getEditorialLookById(id);
    look.setHeroAsset(null);
    await this.editorialLookRepository.update(look);

    return look;
  }

  async getLooksByHeroAsset(assetId: string): Promise<EditorialLook[]> {
    const mediaAssetId = EntityMediaAssetId.fromString(assetId);
    return await this.editorialLookRepository.findByHeroAsset(mediaAssetId);
  }

  // Product association management
  async addProductToLook(lookId: string, productId: string): Promise<void> {
    const lookIdVo = EditorialLookId.fromString(lookId);
    const lookIdEntity = EntityEditorialLookId.fromString(lookId);

    // Validate look exists
    const look = await this.editorialLookRepository.findById(lookIdEntity);
    if (!look) {
      throw new Error(`Editorial look with ID "${lookId}" not found`);
    }

    // Validate product exists
    const productIdVo = ProductId.fromString(productId);
    const product = await this.productRepository.findById(productIdVo);
    if (!product) {
      throw new Error(`Product with ID "${productId}" not found`);
    }

    try {
      await this.editorialLookRepository.addProductToLook(
        lookIdEntity,
        productId
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate")) {
        throw new Error(
          `Product "${productId}" is already associated with this editorial look`
        );
      }
      throw error;
    }
  }

  async removeProductFromLook(
    lookId: string,
    productId: string
  ): Promise<void> {
    const lookIdEntity = EntityEditorialLookId.fromString(lookId);

    // Validate association exists
    const exists = await this.editorialLookRepository.existsProductInLook(
      lookIdEntity,
      productId
    );
    if (!exists) {
      throw new Error(
        `Product "${productId}" is not associated with look "${lookId}"`
      );
    }

    await this.editorialLookRepository.removeProductFromLook(
      lookIdEntity,
      productId
    );
  }

  async setLookProducts(
    id: string,
    productIds: string[]
  ): Promise<EditorialLook> {
    // Validate look exists (this also serves as validation)
    await this.getEditorialLookById(id);

    // Validate all products exist
    for (const productId of productIds) {
      const productIdVo = ProductId.fromString(productId);
      const product = await this.productRepository.findById(productIdVo);
      if (!product) {
        throw new Error(`Product with ID "${productId}" not found`);
      }
    }

    // Use repository for consistency instead of entity method
    const lookIdEntity = EntityEditorialLookId.fromString(id);
    await this.editorialLookRepository.setLookProducts(
      lookIdEntity,
      productIds
    );

    // Return updated look
    return await this.getEditorialLookById(id);
  }

  async getLookProducts(id: string): Promise<string[]> {
    const lookIdEntity = EntityEditorialLookId.fromString(id);

    // Validate look exists
    const look = await this.editorialLookRepository.findById(lookIdEntity);
    if (!look) {
      throw new Error(`Editorial look with ID "${id}" not found`);
    }

    const productIds =
      await this.editorialLookRepository.getLookProducts(lookIdEntity);
    return productIds;
  }

  async getProductLooks(productId: string): Promise<string[]> {
    const productIdVo = ProductId.fromString(productId);

    // Validate product exists
    const product = await this.productRepository.findById(productIdVo);
    if (!product) {
      throw new Error(`Product with ID "${productId}" not found`);
    }

    const lookIds =
      await this.editorialLookRepository.getProductLooks(productId);
    return lookIds.map((id) => id.getValue());
  }

  async getLooksByProduct(
    productId: string,
    options?: EditorialLookQueryOptions
  ): Promise<EditorialLook[]> {
    return await this.editorialLookRepository.findByProductId(
      productId,
      options
    );
  }

  // Content management
  async updateStoryContent(
    id: string,
    storyHtml: string
  ): Promise<EditorialLook> {
    this.validateHtmlContent(storyHtml);
    return this.updateEditorialLook(id, { storyHtml });
  }

  async clearStoryContent(id: string): Promise<EditorialLook> {
    return this.updateEditorialLook(id, { storyHtml: null });
  }

  async getLooksWithContent(
    options?: EditorialLookQueryOptions
  ): Promise<EditorialLook[]> {
    // Get all looks and filter in memory since hasContent is not available in query options
    const allLooks = await this.editorialLookRepository.findAll(options);
    return allLooks.filter((look) => look.hasStory());
  }

  async getLooksWithoutContent(
    options?: EditorialLookQueryOptions
  ): Promise<EditorialLook[]> {
    // Get all looks and filter in memory since hasContent is not available in query options
    const allLooks = await this.editorialLookRepository.findAll(options);
    return allLooks.filter((look) => !look.hasStory());
  }

  // Analytics and statistics
  async getEditorialLookStats(): Promise<{
    totalLooks: number;
    publishedLooks: number;
    scheduledLooks: number;
    draftLooks: number;
    looksWithHeroImage: number;
    looksWithProducts: number;
    looksWithContent: number;
  }> {
    // Execute all counts in parallel for better performance
    const [
      totalLooks,
      publishedLooks,
      scheduledLooks,
      draftLooks,
      looksWithHeroImage,
      looksWithProducts,
      allLooks,
    ] = await Promise.all([
      this.editorialLookRepository.count(),
      this.editorialLookRepository.count({ published: true }),
      this.editorialLookRepository.count({ scheduled: true }),
      this.editorialLookRepository.count({ draft: true }),
      this.editorialLookRepository.count({ hasHeroImage: true }),
      this.editorialLookRepository.count({ hasProducts: true }),
      this.editorialLookRepository.findAll(), // Get all looks to count those with content
    ]);

    const looksWithContent = allLooks.filter((look) => look.hasStory()).length;

    return {
      totalLooks,
      publishedLooks,
      scheduledLooks,
      draftLooks,
      looksWithHeroImage,
      looksWithProducts,
      looksWithContent,
    };
  }

  async getPopularProducts(
    limit: number = 10
  ): Promise<Array<{ productId: string; appearanceCount: number }>> {
    const allLooks = await this.getAllEditorialLooks();
    const productCounts = new Map<string, number>();

    for (const look of allLooks) {
      const productIds = look.getProductIds();
      for (const productId of productIds) {
        const id = productId.getValue();
        productCounts.set(id, (productCounts.get(id) || 0) + 1);
      }
    }

    return Array.from(productCounts.entries())
      .map(([productId, appearanceCount]) => ({ productId, appearanceCount }))
      .sort((a, b) => b.appearanceCount - a.appearanceCount)
      .slice(0, limit);
  }

  // Bulk operations
  async createMultipleEditorialLooks(
    looksData: CreateEditorialLookData[]
  ): Promise<EditorialLook[]> {
    const createdLooks: EditorialLook[] = [];
    const errors: string[] = [];

    for (const data of looksData) {
      try {
        const look = await this.createEditorialLook(data);
        createdLooks.push(look);
      } catch (error) {
        errors.push(
          `Failed to create editorial look "${data.title}": ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    if (errors.length > 0 && createdLooks.length === 0) {
      throw new Error(
        `Failed to create any editorial looks: ${errors.join(", ")}`
      );
    }

    return createdLooks;
  }

  async deleteMultipleEditorialLooks(ids: string[]): Promise<{
    deleted: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    const deleted: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (const id of ids) {
      try {
        await this.deleteEditorialLook(id);
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

  async publishMultipleLooks(ids: string[]): Promise<{
    published: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    const published: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (const id of ids) {
      try {
        await this.publishLook(id);
        published.push(id);
      } catch (error) {
        failed.push({
          id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return { published, failed };
  }

  // Validation methods
  async validateLookForPublication(
    id: string
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const look = await this.getEditorialLookById(id);
    const errors: string[] = [];

    if (!look.getTitle().trim()) {
      errors.push("Title is required");
    }

    if (!look.hasHeroImage()) {
      errors.push("Hero image is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Utility methods
  async getEditorialLookCount(
    options?: EditorialLookCountOptions
  ): Promise<number> {
    return await this.editorialLookRepository.count(options);
  }

  async duplicateEditorialLook(
    id: string,
    newTitle: string
  ): Promise<EditorialLook> {
    const originalLook = await this.getEditorialLookById(id);

    const duplicateData: CreateEditorialLookData = {
      title: newTitle,
      storyHtml: originalLook.getStoryHtml() || undefined,
      heroAssetId: originalLook.getHeroAssetId()?.getValue(),
      productIds: originalLook.getProductIds().map((id) => id.getValue()),
    };

    return this.createEditorialLook(duplicateData);
  }

  // Private validation methods
  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error("Editorial look title cannot be empty");
    }

    if (title.trim().length > 200) {
      throw new Error(
        "Editorial look title cannot be longer than 200 characters"
      );
    }

    // Check for potentially dangerous characters that could indicate injection attempts
    const dangerousChars = /<script|javascript:|data:|vbscript:/i;
    if (dangerousChars.test(title)) {
      throw new Error(
        "Editorial look title contains potentially unsafe content"
      );
    }
  }

  private validateHtmlContent(htmlContent: string): void {
    if (htmlContent.length > 100000) {
      throw new Error(
        "Editorial look content cannot exceed 100,000 characters"
      );
    }

    // Check for potentially malicious content
    const dangerousPatterns = [
      /<script[^>]*>/i,
      /<iframe[^>]*>/i,
      /<object[^>]*>/i,
      /<embed[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i, // onclick, onload, etc.
      /<form[^>]*>/i,
      /<input[^>]*>/i,
      /<link[^>]*>/i,
      /<meta[^>]*>/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(htmlContent)) {
        throw new Error("HTML content contains potentially unsafe elements");
      }
    }

    // Improved HTML validation - check for balanced tags
    const selfClosingTags = new Set([
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
    ]);

    const tagPattern = /<(\/?[a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    const openTags: string[] = [];
    let match;

    while ((match = tagPattern.exec(htmlContent)) !== null) {
      const tagWithSlash = match[1];
      const isClosingTag = tagWithSlash.startsWith("/");
      const tagName = isClosingTag ? tagWithSlash.substring(1) : tagWithSlash;

      // Skip self-closing tags
      if (!isClosingTag && selfClosingTags.has(tagName.toLowerCase())) {
        continue;
      }

      if (isClosingTag) {
        const lastOpenTag = openTags.pop();
        if (!lastOpenTag) {
          throw new Error(`Unexpected closing tag: </${tagName}>`);
        }
        if (lastOpenTag.toLowerCase() !== tagName.toLowerCase()) {
          throw new Error(
            `Mismatched HTML tags: expected </${lastOpenTag}> but found </${tagName}>`
          );
        }
      } else {
        // Check if it's a self-closing tag with />
        const fullMatch = match[0];
        if (fullMatch.endsWith("/>")) {
          continue;
        }
        openTags.push(tagName);
      }
    }

    if (openTags.length > 0) {
      throw new Error(`Unclosed HTML tags: ${openTags.join(", ")}`);
    }
  }
}
