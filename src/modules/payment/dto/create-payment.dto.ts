import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  courseId: string[];

  @IsString()
  @IsNotEmpty()
  gateway: string;
}
