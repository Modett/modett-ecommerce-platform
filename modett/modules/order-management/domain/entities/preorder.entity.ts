export interface PreorderProps {
  orderItemId: string;
  releaseDate?: Date;
  notifiedAt?: Date;
}

export interface PreorderDatabaseRow {
  order_item_id: string;
  release_date?: Date | null;
  notified_at?: Date | null;
}

export class Preorder {
  private orderItemId: string;
  private releaseDate?: Date;
  private notifiedAt?: Date;

  private constructor(props: PreorderProps) {
    this.orderItemId = props.orderItemId;
    this.releaseDate = props.releaseDate;
    this.notifiedAt = props.notifiedAt;
  }

  static create(props: PreorderProps): Preorder {
    // Validate required fields
    if (!props.orderItemId || props.orderItemId.trim().length === 0) {
      throw new Error('Order item ID is required');
    }

    // Validate orderItemId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(props.orderItemId)) {
      throw new Error('Order item ID must be a valid UUID');
    }

    // Validate release date is in the future
    if (props.releaseDate && props.releaseDate < new Date()) {
      throw new Error('Release date must be in the future');
    }

    return new Preorder(props);
  }

  static reconstitute(props: PreorderProps): Preorder {
    return new Preorder(props);
  }

  static fromDatabaseRow(row: PreorderDatabaseRow): Preorder {
    return new Preorder({
      orderItemId: row.order_item_id,
      releaseDate: row.release_date || undefined,
      notifiedAt: row.notified_at || undefined,
    });
  }

  getOrderItemId(): string {
    return this.orderItemId;
  }

  getReleaseDate(): Date | undefined {
    return this.releaseDate;
  }

  getNotifiedAt(): Date | undefined {
    return this.notifiedAt;
  }

  hasReleaseDate(): boolean {
    return !!this.releaseDate;
  }

  isCustomerNotified(): boolean {
    return !!this.notifiedAt;
  }

  isReleased(): boolean {
    return !!this.releaseDate && this.releaseDate <= new Date();
  }

  updateReleaseDate(releaseDate: Date): void {
    this.releaseDate = releaseDate;
  }

  markAsNotified(): void {
    if (this.notifiedAt) {
      throw new Error('Customer already notified');
    }

    // Validate that the item is released before notifying
    if (this.releaseDate && !this.isReleased()) {
      throw new Error('Cannot notify customer before release date');
    }

    this.notifiedAt = new Date();
  }

  // Utility methods
  toDatabaseRow(): PreorderDatabaseRow {
    return {
      order_item_id: this.orderItemId,
      release_date: this.releaseDate || null,
      notified_at: this.notifiedAt || null,
    };
  }

  toJSON() {
    return {
      orderItemId: this.orderItemId,
      releaseDate: this.releaseDate,
      notifiedAt: this.notifiedAt,
      hasReleaseDate: this.hasReleaseDate(),
      isCustomerNotified: this.isCustomerNotified(),
      isReleased: this.isReleased(),
    };
  }
}
