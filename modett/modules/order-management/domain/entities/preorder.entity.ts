export interface PreorderProps {
  orderItemId: string;
  releaseDate?: Date;
  notifiedAt?: Date;
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
    return new Preorder(props);
  }

  static reconstitute(props: PreorderProps): Preorder {
    return new Preorder(props);
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

    this.notifiedAt = new Date();
  }
}
