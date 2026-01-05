import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartConversationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  toUserId: string;
}

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}
