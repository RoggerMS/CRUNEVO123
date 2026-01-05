import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  body: string;

  @ApiPropertyOptional({ description: 'Materia principal' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(8)
  @Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return String(value)
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  })
  tags?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Lista de URLs de adjuntos (imágenes)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  @Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [String(value)].filter(Boolean);
  })
  attachments?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clubId?: string;
}
