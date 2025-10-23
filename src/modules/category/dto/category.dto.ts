import { Expose } from 'class-transformer';

export class CategoryDto {
  @Expose()
  id: string;

  @Expose()
  categoryName: string;
}
