import { PrismaClient } from "@prisma/client";
import { IMediaAssetRepository, MediaAssetQueryOptions, MediaAssetCountOptions } from "../../../domain/repositories/media-asset.repository";
import { MediaAsset, MediaAssetId } from "../../../domain/entities/media-asset.entity";

export class MediaAssetRepository implements IMediaAssetRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(asset: MediaAsset): Promise<void> {
    const data = asset.toDatabaseRow();

    await this.prisma.mediaAsset.create({
      data: {
        id: data.asset_id,
        storageKey: data.storage_key,
        mime: data.mime,
        width: data.width,
        height: data.height,
        bytes: data.bytes,
        altText: data.alt_text,
        focalX: data.focal_x,
        focalY: data.focal_y,
        renditions: data.renditions as any,
        version: data.version,
        createdAt: data.created_at,
      },
    });
  }

  async findById(id: MediaAssetId): Promise<MediaAsset | null> {
    const assetData = await this.prisma.mediaAsset.findUnique({
      where: { id: id.getValue() },
    });

    if (!assetData) {
      return null;
    }

    return MediaAsset.fromDatabaseRow({
      asset_id: assetData.id,
      storage_key: assetData.storageKey,
      mime: assetData.mime,
      width: assetData.width,
      height: assetData.height,
      bytes: assetData.bytes,
      alt_text: assetData.altText,
      focal_x: assetData.focalX,
      focal_y: assetData.focalY,
      renditions: assetData.renditions as any,
      version: assetData.version,
      created_at: assetData.createdAt,
    });
  }

  async findByStorageKey(storageKey: string): Promise<MediaAsset | null> {
    const assetData = await this.prisma.mediaAsset.findUnique({
      where: { storageKey },
    });

    if (!assetData) {
      return null;
    }

    return MediaAsset.fromDatabaseRow({
      asset_id: assetData.id,
      storage_key: assetData.storageKey,
      mime: assetData.mime,
      width: assetData.width,
      height: assetData.height,
      bytes: assetData.bytes,
      alt_text: assetData.altText,
      focal_x: assetData.focalX,
      focal_y: assetData.focalY,
      renditions: assetData.renditions as any,
      version: assetData.version,
      created_at: assetData.createdAt,
    });
  }

  async findAll(options?: MediaAssetQueryOptions): Promise<MediaAsset[]> {
    const {
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      hasRenditions,
    } = options || {};

    const whereClause: any = {};

    if (hasRenditions !== undefined) {
      if (hasRenditions) {
        whereClause.renditions = {
          not: {},
        };
      } else {
        whereClause.renditions = {};
      }
    }

    const assets = await this.prisma.mediaAsset.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: { [sortBy]: sortOrder },
    });

    return assets.map(assetData => MediaAsset.fromDatabaseRow({
      asset_id: assetData.id,
      storage_key: assetData.storageKey,
      mime: assetData.mime,
      width: assetData.width,
      height: assetData.height,
      bytes: assetData.bytes,
      alt_text: assetData.altText,
      focal_x: assetData.focalX,
      focal_y: assetData.focalY,
      renditions: assetData.renditions as any,
      version: assetData.version,
      created_at: assetData.createdAt,
    }));
  }

  async findByMimeType(mimeType: string, options?: MediaAssetQueryOptions): Promise<MediaAsset[]> {
    const {
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options || {};

    const assets = await this.prisma.mediaAsset.findMany({
      where: { mime: mimeType },
      take: limit,
      skip: offset,
      orderBy: { [sortBy]: sortOrder },
    });

    return assets.map(assetData => MediaAsset.fromDatabaseRow({
      asset_id: assetData.id,
      storage_key: assetData.storageKey,
      mime: assetData.mime,
      width: assetData.width,
      height: assetData.height,
      bytes: assetData.bytes,
      alt_text: assetData.altText,
      focal_x: assetData.focalX,
      focal_y: assetData.focalY,
      renditions: assetData.renditions as any,
      version: assetData.version,
      created_at: assetData.createdAt,
    }));
  }

  async findImages(options?: MediaAssetQueryOptions): Promise<MediaAsset[]> {
    const {
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options || {};

    const assets = await this.prisma.mediaAsset.findMany({
      where: {
        mime: {
          startsWith: 'image/',
        },
      },
      take: limit,
      skip: offset,
      orderBy: { [sortBy]: sortOrder },
    });

    return assets.map(assetData => MediaAsset.fromDatabaseRow({
      asset_id: assetData.id,
      storage_key: assetData.storageKey,
      mime: assetData.mime,
      width: assetData.width,
      height: assetData.height,
      bytes: assetData.bytes,
      alt_text: assetData.altText,
      focal_x: assetData.focalX,
      focal_y: assetData.focalY,
      renditions: assetData.renditions as any,
      version: assetData.version,
      created_at: assetData.createdAt,
    }));
  }

  async findVideos(options?: MediaAssetQueryOptions): Promise<MediaAsset[]> {
    const {
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options || {};

    const assets = await this.prisma.mediaAsset.findMany({
      where: {
        mime: {
          startsWith: 'video/',
        },
      },
      take: limit,
      skip: offset,
      orderBy: { [sortBy]: sortOrder },
    });

    return assets.map(assetData => MediaAsset.fromDatabaseRow({
      asset_id: assetData.id,
      storage_key: assetData.storageKey,
      mime: assetData.mime,
      width: assetData.width,
      height: assetData.height,
      bytes: assetData.bytes,
      alt_text: assetData.altText,
      focal_x: assetData.focalX,
      focal_y: assetData.focalY,
      renditions: assetData.renditions as any,
      version: assetData.version,
      created_at: assetData.createdAt,
    }));
  }

  async findByDimensions(width: number, height: number, options?: MediaAssetQueryOptions): Promise<MediaAsset[]> {
    const {
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options || {};

    const assets = await this.prisma.mediaAsset.findMany({
      where: {
        width,
        height,
      },
      take: limit,
      skip: offset,
      orderBy: { [sortBy]: sortOrder },
    });

    return assets.map(assetData => MediaAsset.fromDatabaseRow({
      asset_id: assetData.id,
      storage_key: assetData.storageKey,
      mime: assetData.mime,
      width: assetData.width,
      height: assetData.height,
      bytes: assetData.bytes,
      alt_text: assetData.altText,
      focal_x: assetData.focalX,
      focal_y: assetData.focalY,
      renditions: assetData.renditions as any,
      version: assetData.version,
      created_at: assetData.createdAt,
    }));
  }

  async findBySizeRange(minBytes: number, maxBytes: number, options?: MediaAssetQueryOptions): Promise<MediaAsset[]> {
    const {
      limit = 50,
      offset = 0,
      sortBy = 'bytes',
      sortOrder = 'asc',
    } = options || {};

    const assets = await this.prisma.mediaAsset.findMany({
      where: {
        bytes: {
          gte: minBytes,
          lte: maxBytes,
        },
      },
      take: limit,
      skip: offset,
      orderBy: { [sortBy]: sortOrder },
    });

    return assets.map(assetData => MediaAsset.fromDatabaseRow({
      asset_id: assetData.id,
      storage_key: assetData.storageKey,
      mime: assetData.mime,
      width: assetData.width,
      height: assetData.height,
      bytes: assetData.bytes,
      alt_text: assetData.altText,
      focal_x: assetData.focalX,
      focal_y: assetData.focalY,
      renditions: assetData.renditions as any,
      version: assetData.version,
      created_at: assetData.createdAt,
    }));
  }

  async findOrphaned(): Promise<MediaAsset[]> {
    // Find assets that are not referenced in product_media or variant_media
    const assets = await this.prisma.mediaAsset.findMany({
      where: {
        AND: [
          {
            productMedia: {
              none: {},
            },
          },
          {
            variantMedia: {
              none: {},
            },
          },
          {
            editorialLooksAsHero: {
              none: {},
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return assets.map(assetData => MediaAsset.fromDatabaseRow({
      asset_id: assetData.id,
      storage_key: assetData.storageKey,
      mime: assetData.mime,
      width: assetData.width,
      height: assetData.height,
      bytes: assetData.bytes,
      alt_text: assetData.altText,
      focal_x: assetData.focalX,
      focal_y: assetData.focalY,
      renditions: assetData.renditions as any,
      version: assetData.version,
      created_at: assetData.createdAt,
    }));
  }

  async update(asset: MediaAsset): Promise<void> {
    const data = asset.toDatabaseRow();

    await this.prisma.mediaAsset.update({
      where: { id: data.asset_id },
      data: {
        storageKey: data.storage_key,
        mime: data.mime,
        width: data.width,
        height: data.height,
        bytes: data.bytes,
        altText: data.alt_text,
        focalX: data.focal_x,
        focalY: data.focal_y,
        renditions: data.renditions as any,
        version: data.version,
      },
    });
  }

  async delete(id: MediaAssetId): Promise<void> {
    await this.prisma.mediaAsset.delete({
      where: { id: id.getValue() },
    });
  }

  async exists(id: MediaAssetId): Promise<boolean> {
    const count = await this.prisma.mediaAsset.count({
      where: { id: id.getValue() },
    });
    return count > 0;
  }

  async existsByStorageKey(storageKey: string): Promise<boolean> {
    const count = await this.prisma.mediaAsset.count({
      where: { storageKey },
    });
    return count > 0;
  }

  async count(options?: MediaAssetCountOptions): Promise<number> {
    const whereClause: any = {};

    if (options?.mimeType) {
      whereClause.mime = options.mimeType;
    }

    if (options?.isImage) {
      whereClause.mime = {
        startsWith: 'image/',
      };
    }

    if (options?.isVideo) {
      whereClause.mime = {
        startsWith: 'video/',
      };
    }

    if (options?.hasRenditions !== undefined) {
      if (options.hasRenditions) {
        whereClause.renditions = {
          not: {},
        };
      } else {
        whereClause.renditions = {};
      }
    }

    return await this.prisma.mediaAsset.count({
      where: whereClause,
    });
  }

  async getTotalSize(): Promise<number> {
    const result = await this.prisma.mediaAsset.aggregate({
      _sum: {
        bytes: true,
      },
    });

    return result._sum.bytes || 0;
  }
}