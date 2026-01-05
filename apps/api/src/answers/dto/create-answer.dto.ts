import { ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateAnswerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  body: string;

  @ApiPropertyOptional({ type: [String], description: 'Adjuntos opcionales (URLs de imagen)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(3)
  @Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [String(value)].filter(Boolean);
  })
  attachments?: string[];
}
