import { v4 as uuidv4 } from 'uuid';

export class ProductTagId {
  private constructor(private readonly value: string) {
    if (!value) {
      throw new Error('Product Tag ID cannot be empty');
    }

    if (!this.isValidUuid(value)) {
      throw new Error('Product Tag ID must be a valid UUID');
    }
  }

  static create(): ProductTagId {
    return new ProductTagId(uuidv4());
  }

  static fromString(value: string): ProductTagId {
    return new ProductTagId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProductTagId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

export class ProductTag {
  private constructor(
    private readonly id: ProductTagId,
    private tag: string,
    private kind: string | null
  ) {}

  static create(data: CreateProductTagData): ProductTag {
    const tagId = ProductTagId.create();

    return new ProductTag(
      tagId,
      data.tag,
      data.kind || null
    );
  }

  static reconstitute(data: ProductTagData): ProductTag {
    return new ProductTag(
      ProductTagId.fromString(data.id),
      data.tag,
      data.kind
    );
  }

  static fromDatabaseRow(row: ProductTagRow): ProductTag {
    return new ProductTag(
      ProductTagId.fromString(row.tag_id),
      row.tag,
      row.kind
    );
  }

  // Getters
  getId(): ProductTagId {
    return this.id;
  }

  getTag(): string {
    return this.tag;
  }

  getKind(): string | null {
    return this.kind;
  }

  // Business logic methods
  updateTag(newTag: string): void {
    if (!newTag || newTag.trim().length === 0) {
      throw new Error("Tag cannot be empty");
    }

    if (newTag.trim().length > 100) {
      throw new Error("Tag cannot be longer than 100 characters");
    }

    this.tag = newTag.trim();
  }

  updateKind(newKind: string | null): void {
    if (newKind && newKind.trim().length > 50) {
      throw new Error("Kind cannot be longer than 50 characters");
    }

    this.kind = newKind?.trim() || null;
  }

  // Validation methods
  isCategory(): boolean {
    return this.kind === 'category';
  }

  isBrand(): boolean {
    return this.kind === 'brand';
  }

  isColor(): boolean {
    return this.kind === 'color';
  }

  isMaterial(): boolean {
    return this.kind === 'material';
  }

  isSize(): boolean {
    return this.kind === 'size';
  }

  isStyle(): boolean {
    return this.kind === 'style';
  }

  isGeneral(): boolean {
    return this.kind === null || this.kind === 'general';
  }

  // Convert to data for persistence
  toData(): ProductTagData {
    return {
      id: this.id.getValue(),
      tag: this.tag,
      kind: this.kind,
    };
  }

  toDatabaseRow(): ProductTagRow {
    return {
      tag_id: this.id.getValue(),
      tag: this.tag,
      kind: this.kind,
    };
  }

  equals(other: ProductTag): boolean {
    return this.id.equals(other.id);
  }
}

// Supporting types and interfaces
export interface CreateProductTagData {
  tag: string;
  kind?: string;
}

export interface ProductTagData {
  id: string;
  tag: string;
  kind: string | null;
}

export interface ProductTagRow {
  tag_id: string;
  tag: string;
  kind: string | null;
}