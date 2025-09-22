import { ProductId } from "../value-objects/product-id.vo";
import { Slug } from "../value-objects/slug.vo";

export enum ProductStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  SCHEDULED = "scheduled",
}

export class Product {
  private constructor(
    private readonly id: ProductId,
    private title: string,
    private slug: Slug,
    private brand: string | null,
    private shortDesc: string | null,
    private longDescHtml: string | null,
    private status: ProductStatus,
    private publishAt: Date | null,
    private countryOfOrigin: string | null,
    private seoTitle: string | null,
    private seoDescription: string | null,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(data: CreateProductData): Product {
    const productId = ProductId.create();
    const slug = Slug.create(data.title);
    const now = new Date();

    return new Product(
      productId,
      data.title,
      slug,
      data.brand || null,
      data.shortDesc || null,
      data.longDescHtml || null,
      data.status || ProductStatus.DRAFT,
      data.publishAt || null,
      data.countryOfOrigin || null,
      data.seoTitle || null,
      data.seoDescription || null,
      now,
      now
    );
  }

  static reconstitute(data: ProductData): Product {
    return new Product(
      ProductId.fromString(data.id),
      data.title,
      Slug.fromString(data.slug),
      data.brand,
      data.shortDesc,
      data.longDescHtml,
      data.status,
      data.publishAt,
      data.countryOfOrigin,
      data.seoTitle,
      data.seoDescription,
      data.createdAt,
      data.updatedAt
    );
  }

  static fromDatabaseRow(row: ProductRow): Product {
    return new Product(
      ProductId.fromString(row.product_id),
      row.title,
      Slug.fromString(row.slug),
      row.brand,
      row.short_desc,
      row.long_desc_html,
      row.status,
      row.publish_at,
      row.country_of_origin,
      row.seo_title,
      row.seo_description,
      row.created_at,
      row.updated_at
    );
  }

  // Getters
  getId(): ProductId {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getSlug(): Slug {
    return this.slug;
  }

  getBrand(): string | null {
    return this.brand;
  }

  getShortDesc(): string | null {
    return this.shortDesc;
  }

  getLongDescHtml(): string | null {
    return this.longDescHtml;
  }

  getStatus(): ProductStatus {
    return this.status;
  }

  getPublishAt(): Date | null {
    return this.publishAt;
  }

  getCountryOfOrigin(): string | null {
    return this.countryOfOrigin;
  }

  getSeoTitle(): string | null {
    return this.seoTitle;
  }

  getSeoDescription(): string | null {
    return this.seoDescription;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business logic methods
  updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new Error("Title cannot be empty");
    }

    this.title = newTitle.trim();
    this.slug = Slug.create(newTitle);
    this.touch();
  }

  updateSlug(newSlug: string): void {
    const slug = Slug.fromString(newSlug);
    this.slug = slug;
    this.touch();
  }

  updateBrand(newBrand: string | null): void {
    this.brand = newBrand?.trim() || null;
    this.touch();
  }

  updateShortDesc(newShortDesc: string | null): void {
    this.shortDesc = newShortDesc?.trim() || null;
    this.touch();
  }

  updateLongDescHtml(newLongDescHtml: string | null): void {
    this.longDescHtml = newLongDescHtml?.trim() || null;
    this.touch();
  }

  updateSeoInfo(seoTitle: string | null, seoDescription: string | null): void {
    this.seoTitle = seoTitle?.trim() || null;
    this.seoDescription = seoDescription?.trim() || null;
    this.touch();
  }

  updateCountryOfOrigin(countryOfOrigin: string | null): void {
    this.countryOfOrigin = countryOfOrigin?.trim() || null;
    this.touch();
  }

  publish(): void {
    if (this.status === ProductStatus.PUBLISHED) {
      return;
    }

    this.status = ProductStatus.PUBLISHED;
    this.publishAt = new Date();
    this.touch();
  }

  unpublish(): void {
    if (this.status === ProductStatus.DRAFT) {
      return;
    }

    this.status = ProductStatus.DRAFT;
    this.publishAt = null;
    this.touch();
  }

  schedulePublication(publishAt: Date): void {
    if (publishAt <= new Date()) {
      throw new Error("Scheduled publication date must be in the future");
    }

    this.status = ProductStatus.SCHEDULED;
    this.publishAt = publishAt;
    this.touch();
  }

  // Validation methods
  isPublished(): boolean {
    return this.status === ProductStatus.PUBLISHED;
  }

  isScheduled(): boolean {
    return this.status === ProductStatus.SCHEDULED;
  }

  isDraft(): boolean {
    return this.status === ProductStatus.DRAFT;
  }

  canBePublished(): boolean {
    return this.title.trim().length > 0;
  }

  shouldBePublishedNow(): boolean {
    return (
      this.status === ProductStatus.SCHEDULED &&
      this.publishAt !== null &&
      this.publishAt <= new Date()
    );
  }

  // Internal methods
  private touch(): void {
    this.updatedAt = new Date();
  }

  // Convert to data for persistence
  toData(): ProductData {
    return {
      id: this.id.getValue(),
      title: this.title,
      slug: this.slug.getValue(),
      brand: this.brand,
      shortDesc: this.shortDesc,
      longDescHtml: this.longDescHtml,
      status: this.status,
      publishAt: this.publishAt,
      countryOfOrigin: this.countryOfOrigin,
      seoTitle: this.seoTitle,
      seoDescription: this.seoDescription,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toDatabaseRow(): ProductRow {
    return {
      product_id: this.id.getValue(),
      title: this.title,
      slug: this.slug.getValue(),
      brand: this.brand,
      short_desc: this.shortDesc,
      long_desc_html: this.longDescHtml,
      status: this.status,
      publish_at: this.publishAt,
      country_of_origin: this.countryOfOrigin,
      seo_title: this.seoTitle,
      seo_description: this.seoDescription,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  equals(other: Product): boolean {
    return this.id.equals(other.id);
  }
}

// Supporting types and interfaces
export interface CreateProductData {
  title: string;
  brand?: string;
  shortDesc?: string;
  longDescHtml?: string;
  status?: ProductStatus;
  publishAt?: Date;
  countryOfOrigin?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ProductData {
  id: string;
  title: string;
  slug: string;
  brand: string | null;
  shortDesc: string | null;
  longDescHtml: string | null;
  status: ProductStatus;
  publishAt: Date | null;
  countryOfOrigin: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductRow {
  product_id: string;
  title: string;
  slug: string;
  brand: string | null;
  short_desc: string | null;
  long_desc_html: string | null;
  status: ProductStatus;
  publish_at: Date | null;
  country_of_origin: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: Date;
  updated_at: Date;
}