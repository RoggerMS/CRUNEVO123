import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clubId?: string;
}
