import { ICategoryRepository } from '../../domain/repositories/category.repository';
import { SlugGeneratorService } from './slug-generator.service';

export class CategoryManagementService {
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly slugGeneratorService: SlugGeneratorService
  ) {}

  // TODO: Implement category management methods
}