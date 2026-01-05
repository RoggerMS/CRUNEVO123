import { Controller, Get, Param, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':type/:id')
  list(@Param('type') type: 'post' | 'document' | 'question', @Param('id') id: string) {
    return this.commentsService.list(type, id);
  }

  @Post(':type/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  add(
    @Request() req: any,
    @Param('type') type: 'post' | 'document' | 'question',
    @Param('id') id: string,
    @Body('body') body: string,
  ) {
    return this.commentsService.add(req.user.userId, type, id, body);
  }
}

