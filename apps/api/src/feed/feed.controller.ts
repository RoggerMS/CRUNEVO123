import { Controller, Get } from '@nestjs/common';
import { FeedService } from './feed.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('feed')
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  getFeed() {
    return this.feedService.getFeed();
  }

  @Get('sidebar-items')
  getSidebarItems() {
    return this.feedService.getSidebarItems();
  }
}
