import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { StartConversationDto, CreateMessageDto } from './dto/messages.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  getConversations(@Request() req: any) {
    return this.messagesService.getConversations(req.user.userId);
  }

  @Post('conversations')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  startConversation(@Request() req: any, @Body() startConversationDto: StartConversationDto) {
    return this.messagesService.startConversation(req.user.userId, startConversationDto);
  }

  @Get('conversations/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  getMessages(@Request() req: any, @Param('id') id: string) {
    return this.messagesService.getMessages(req.user.userId, id);
  }

  @Post('conversations/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  sendMessage(
    @Request() req: any,
    @Param('id') id: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messagesService.sendMessage(req.user.userId, id, createMessageDto);
  }
}
