import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Visibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  CLUB = 'CLUB',
}

export class CreateDocumentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clubId?: string;

  @ApiPropertyOptional({ enum: Visibility, default: Visibility.PUBLIC })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;
}
