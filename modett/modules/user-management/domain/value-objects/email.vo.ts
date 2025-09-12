// Email value object
export class Email {
  constructor(public readonly value: string) {
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(value)) {
      throw new Error("Invalid email");
    }
  }
}
