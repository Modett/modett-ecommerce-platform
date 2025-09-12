export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!email) {
      throw new Error("Email is required");
    }

    const trimmed = email.trim();
    if (!trimmed) {
      throw new Error("Email cannot be empty");
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      throw new Error("Invalid email format");
    }

    const normalized = trimmed.toLowerCase();
    return new Email(normalized);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
