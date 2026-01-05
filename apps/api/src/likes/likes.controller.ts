import { Controller, Param, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LikesService } from './likes.service';

@ApiTags('likes')
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':type/:id/toggle')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  toggle(@Request() req: any, @Param('type') type: 'post' | 'document' | 'question', @Param('id') id: string) {
    return this.likesService.toggle(req.user.userId, type, id);
  }
}

