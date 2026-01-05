import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VoteDto {
  @ApiProperty({ enum: ['QUESTION', 'ANSWER'] })
  @IsEnum(['QUESTION', 'ANSWER'])
  targetType: 'QUESTION' | 'ANSWER';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty()
  @IsNumber()
  value: number; // 1 or -1
}
