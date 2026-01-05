import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body: string;
}
