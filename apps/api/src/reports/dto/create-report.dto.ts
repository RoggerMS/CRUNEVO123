import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TargetType } from '@prisma/client';

export class CreateReportDto {
  @ApiProperty({ enum: TargetType })
  @IsEnum(TargetType)
  targetType: TargetType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;
}
