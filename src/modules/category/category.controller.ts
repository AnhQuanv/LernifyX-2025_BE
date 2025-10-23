import { Controller, Get } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiResponse } from 'src/common/bases/api-response';

@Controller('v1/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('all')
  async getAllCategories() {
    const result = await this.categoryService.findAll();
    return ApiResponse.success(result, 'Lấy danh sách danh mục thành công');
  }
}
