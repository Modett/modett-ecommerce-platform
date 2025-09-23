import { PrismaClient } from "@prisma/client";
import { IProductTagRepository, ProductTagQueryOptions, ProductTagCountOptions } from "../../../domain/repositories/product-tag.repository";
import { ProductTag, ProductTagId } from "../../../domain/entities/product-tag.entity";

export class ProductTagRepository implements IProductTagRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(tag: ProductTag): Promise<void> {
    const data = tag.toDatabaseRow();

    await this.prisma.productTag.create({
      data: {
        id: data.tag_id,
        tag: data.tag,
        kind: data.kind,
      },
    });
  }

  async findById(id: ProductTagId): Promise<ProductTag | null> {
    const tagData = await this.prisma.productTag.findUnique({
      where: { id: id.getValue() },
    });

    if (!tagData) {
      return null;
    }

    return ProductTag.fromDatabaseRow({
      tag_id: tagData.id,
      tag: tagData.tag,
      kind: tagData.kind,
    });
  }

  async findByTag(tagName: string): Promise<ProductTag | null> {
    const tagData = await this.prisma.productTag.findUnique({
      where: { tag: tagName },
    });

    if (!tagData) {
      return null;
    }

    return ProductTag.fromDatabaseRow({
      tag_id: tagData.id,
      tag: tagData.tag,
      kind: tagData.kind,
    });
  }

  async findAll(options?: ProductTagQueryOptions): Promise<ProductTag[]> {
    const {
      limit = 100,
      offset = 0,
      sortBy = 'tag',
      sortOrder = 'asc',
      kind,
    } = options || {};

    const whereClause: any = {};
    if (kind) {
      whereClause.kind = kind;
    }

    const tags = await this.prisma.productTag.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: { [sortBy]: sortOrder },
    });

    return tags.map(tagData => ProductTag.fromDatabaseRow({
      tag_id: tagData.id,
      tag: tagData.tag,
      kind: tagData.kind,
    }));
  }

  async findByKind(kind: string, options?: ProductTagQueryOptions): Promise<ProductTag[]> {
    const {
      limit = 100,
      offset = 0,
      sortBy = 'tag',
      sortOrder = 'asc',
    } = options || {};

    const tags = await this.prisma.productTag.findMany({
      where: { kind },
      take: limit,
      skip: offset,
      orderBy: { [sortBy]: sortOrder },
    });

    return tags.map(tagData => ProductTag.fromDatabaseRow({
      tag_id: tagData.id,
      tag: tagData.tag,
      kind: tagData.kind,
    }));
  }

  async findByProductId(productId: string): Promise<ProductTag[]> {
    const associations = await this.prisma.productTagAssociation.findMany({
      where: { productId },
      include: { tag: true },
    });

    return associations.map(assoc => ProductTag.fromDatabaseRow({
      tag_id: assoc.tag.id,
      tag: assoc.tag.tag,
      kind: assoc.tag.kind,
    }));
  }

  async search(query: string, options?: ProductTagQueryOptions): Promise<ProductTag[]> {
    const {
      limit = 50,
      offset = 0,
      sortBy = 'tag',
      sortOrder = 'asc',
    } = options || {};

    const tags = await this.prisma.productTag.findMany({
      where: {
        tag: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: limit,
      skip: offset,
      orderBy: { [sortBy]: sortOrder },
    });

    return tags.map(tagData => ProductTag.fromDatabaseRow({
      tag_id: tagData.id,
      tag: tagData.tag,
      kind: tagData.kind,
    }));
  }

  async getMostUsed(limit: number = 10): Promise<Array<{ tag: ProductTag; count: number }>> {
    const results = await this.prisma.productTag.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        products: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return results.map(result => ({
      tag: ProductTag.fromDatabaseRow({
        tag_id: result.id,
        tag: result.tag,
        kind: result.kind,
      }),
      count: result._count.products,
    }));
  }

  async update(tag: ProductTag): Promise<void> {
    const data = tag.toDatabaseRow();

    await this.prisma.productTag.update({
      where: { id: data.tag_id },
      data: {
        tag: data.tag,
        kind: data.kind,
      },
    });
  }

  async delete(id: ProductTagId): Promise<void> {
    await this.prisma.productTag.delete({
      where: { id: id.getValue() },
    });
  }

  async exists(id: ProductTagId): Promise<boolean> {
    const count = await this.prisma.productTag.count({
      where: { id: id.getValue() },
    });
    return count > 0;
  }

  async existsByTag(tagName: string): Promise<boolean> {
    const count = await this.prisma.productTag.count({
      where: { tag: tagName },
    });
    return count > 0;
  }

  async count(options?: ProductTagCountOptions): Promise<number> {
    const whereClause: any = {};

    if (options?.kind) {
      whereClause.kind = options.kind;
    }

    if (options?.productId) {
      whereClause.products = {
        some: {
          productId: options.productId,
        },
      };
    }

    return await this.prisma.productTag.count({
      where: whereClause,
    });
  }

  // Product-Tag association methods
  async addTagToProduct(productId: string, tagId: ProductTagId): Promise<void> {
    await this.prisma.productTagAssociation.create({
      data: {
        productId,
        tagId: tagId.getValue(),
      },
    });
  }

  async removeTagFromProduct(productId: string, tagId: ProductTagId): Promise<void> {
    await this.prisma.productTagAssociation.delete({
      where: {
        productId_tagId: {
          productId,
          tagId: tagId.getValue(),
        },
      },
    });
  }

  async getProductTagAssociations(productId: string): Promise<ProductTagId[]> {
    const associations = await this.prisma.productTagAssociation.findMany({
      where: { productId },
      select: { tagId: true },
    });

    return associations.map(assoc => ProductTagId.fromString(assoc.tagId));
  }

  async getTagProductAssociations(tagId: ProductTagId): Promise<string[]> {
    const associations = await this.prisma.productTagAssociation.findMany({
      where: { tagId: tagId.getValue() },
      select: { productId: true },
    });

    return associations.map(assoc => assoc.productId);
  }
}