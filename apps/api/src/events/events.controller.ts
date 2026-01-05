import { Controller, Get, Post, Body, UseGuards, Request, Patch, Param, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Role, EventStatus } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  create(@Request() req: any, @Body() data: any) {
    return this.eventsService.create(req.user, data);
  }

  @Get()
  findAll() {
    return this.eventsService.findAllPublic();
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  findAllForAdmin() {
    return this.eventsService.findAllForAdmin();
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  updateStatus(@Param('id') id: string, @Body('status') status: EventStatus) {
    return this.eventsService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  delete(@Param('id') id: string) {
      return this.eventsService.delete(id);
  }
}
