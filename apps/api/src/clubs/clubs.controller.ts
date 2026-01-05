import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('clubs')
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  create(@Request() req: any, @Body() createClubDto: CreateClubDto) {
    return this.clubsService.create(req.user.userId, createClubDto);
  }

  @Get('my-clubs')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  findMyClubs(@Request() req: any) {
    return this.clubsService.findUserClubs(req.user.userId);
  }

  @Get()
  findAll() {
    return this.clubsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubsService.findOne(id);
  }

  @Post(':id/join')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  join(@Request() req: any, @Param('id') id: string) {
    return this.clubsService.join(id, req.user.userId);
  }

  @Post(':id/leave')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  leave(@Request() req: any, @Param('id') id: string) {
    return this.clubsService.leave(id, req.user.userId);
  }

  @Get(':id/feed')
  getFeed(@Param('id') id: string) {
    return this.clubsService.getClubFeed(id);
  }

  @Get('user/:userId')
  findUserPublicClubs(@Param('userId') userId: string) {
    return this.clubsService.findUserClubs(userId);
  }
}
