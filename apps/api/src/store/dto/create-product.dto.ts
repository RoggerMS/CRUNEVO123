import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductType {
  DIGITAL_RESOURCE = 'DIGITAL_RESOURCE',
  COURSE = 'COURSE',
  SERVICE = 'SERVICE',
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ enum: ProductType })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;
}
