// Phone value object
export class Phone {
  constructor(public readonly value: string) {
    if (!/^\+?[0-9]{7,15}$/.test(value)) {
      throw new Error("Invalid phone number");
    }
  }
}
