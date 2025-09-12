 export class Phone {
    private constructor(private readonly value: string) {}

    static create(phone: string): Phone {
      if (!phone) {
        throw new Error('Phone number is required');
      }

      const cleaned = phone.replace(/\D/g, ''); // Remove all non-digits

      if (cleaned.length < 7) {
        throw new Error('Phone number too short');
      }

      if (cleaned.length > 15) {
        throw new Error('Phone number too long');
      }

      // Store with + prefix if not present
      const normalized = cleaned.startsWith('1') ? `+${cleaned}` : `+${cleaned}`;

      return new Phone(normalized);
    }

    static createOptional(phone?: string): Phone | null {
      if (!phone || !phone.trim()) {
        return null;
      }
      return Phone.create(phone);
    }

    getValue(): string {
      return this.value;
    }

    getFormatted(): string {
      // Basic formatting for display
      const digits = this.value.replace(/\D/g, '');
      if (digits.length === 11 && digits.startsWith('1')) {
        return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
      }
      return this.value;
    }

    equals(other: Phone): boolean {
      return this.value === other.value;
    }

    toString(): string {
      return this.value;
    }
  }