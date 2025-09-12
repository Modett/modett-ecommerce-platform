// Address value object
export class AddressVO {
  constructor(
    public readonly street: string,
    public readonly city: string,
    public readonly state: string,
    public readonly zip: string,
    public readonly country: string
  ) {}
}
