export interface BackorderProps {
  orderItemId: string;
  promisedEta?: Date;
  notifiedAt?: Date;
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
    return new Backorder(props);
  }

  static reconstitute(props: BackorderProps): Backorder {
    return new Backorder(props);
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
}
