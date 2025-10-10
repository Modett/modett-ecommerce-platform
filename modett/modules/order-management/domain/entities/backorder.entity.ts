export interface BackorderProps {
  orderItemId: string;
  promisedEta?: Date;
  notifiedAt?: Date;
}

export interface BackorderDatabaseRow {
  order_item_id: string;
  promised_eta?: Date | null;
  notified_at?: Date | null;
}

export class Backorder {
  private orderItemId: string;
  private promisedEta?: Date;
  private notifiedAt?: Date;

  private constructor(props: BackorderProps) {
    this.orderItemId = props.orderItemId;
    this.promisedEta = props.promisedEta;
    this.notifiedAt = props.notifiedAt;
  }

  static create(props: BackorderProps): Backorder {
    // Validate required fields
    if (!props.orderItemId || props.orderItemId.trim().length === 0) {
      throw new Error('Order item ID is required');
    }

    // Validate orderItemId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(props.orderItemId)) {
      throw new Error('Order item ID must be a valid UUID');
    }

    // Validate promised ETA is in the future
    if (props.promisedEta && props.promisedEta < new Date()) {
      throw new Error('Promised ETA must be in the future');
    }

    return new Backorder(props);
  }

  static reconstitute(props: BackorderProps): Backorder {
    return new Backorder(props);
  }

  static fromDatabaseRow(row: BackorderDatabaseRow): Backorder {
    return new Backorder({
      orderItemId: row.order_item_id,
      promisedEta: row.promised_eta || undefined,
      notifiedAt: row.notified_at || undefined,
    });
  }

  getOrderItemId(): string {
    return this.orderItemId;
  }

  getPromisedEta(): Date | undefined {
    return this.promisedEta;
  }

  getNotifiedAt(): Date | undefined {
    return this.notifiedAt;
  }

  hasPromisedEta(): boolean {
    return !!this.promisedEta;
  }

  isCustomerNotified(): boolean {
    return !!this.notifiedAt;
  }

  updatePromisedEta(eta: Date): void {
    if (eta < new Date()) {
      throw new Error('Promised ETA cannot be in the past');
    }

    this.promisedEta = eta;
  }

  markAsNotified(): void {
    if (this.notifiedAt) {
      throw new Error('Customer already notified');
    }

    this.notifiedAt = new Date();
  }

  // Utility methods
  toDatabaseRow(): BackorderDatabaseRow {
    return {
      order_item_id: this.orderItemId,
      promised_eta: this.promisedEta || null,
      notified_at: this.notifiedAt || null,
    };
  }

  toJSON() {
    return {
      orderItemId: this.orderItemId,
      promisedEta: this.promisedEta,
      notifiedAt: this.notifiedAt,
      hasPromisedEta: this.hasPromisedEta(),
      isCustomerNotified: this.isCustomerNotified(),
    };
  }
}
