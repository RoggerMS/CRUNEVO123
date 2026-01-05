import { Controller, Post, Get, Param, UseGuards, Request, Body } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('bookmarks')
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post(':type/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  toggle(@Request() req: any, @Param('type') type: string, @Param('id') id: string) {
    // Basic validation of type
    const cleanType = type.toUpperCase();
    if (cleanType !== 'DOCUMENT' && cleanType !== 'QUESTION') {
        throw new Error('Invalid type. Must be DOCUMENT or QUESTION');
    }
    return this.bookmarksService.toggleBookmark(req.user.userId, cleanType as any, id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  getMyBookmarks(@Request() req: any) {
    return this.bookmarksService.getMyBookmarks(req.user.userId);
  }
}
