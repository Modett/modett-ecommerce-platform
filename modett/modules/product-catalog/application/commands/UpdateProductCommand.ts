import { ICommand } from './Command';

export class UpdateProductCommand implements ICommand {
  readonly commandId?: string;
  readonly timestamp?: Date;

  constructor(
    public readonly productId: string,
    public readonly title?: string,
    public readonly brand?: string,
    public readonly shortDesc?: string,
    public readonly longDescHtml?: string,
    public readonly status?: 'draft' | 'published' | 'scheduled',
    public readonly publishAt?: Date,
    public readonly countryOfOrigin?: string,
    public readonly seoTitle?: string,
    public readonly seoDescription?: string,
    public readonly categoryIds?: string[],
    public readonly tags?: string[],
    commandId?: string
  ) {
    this.commandId = commandId;
    this.timestamp = new Date();
  }
}