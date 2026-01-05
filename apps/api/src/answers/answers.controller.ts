import { Controller, Get, Patch, Param, UseGuards, Request, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnswersService } from './answers.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ContentStatus, Role } from '@prisma/client';

@ApiTags('answers')
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Get('mine')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  mine(@Request() req: any) {
    return this.answersService.listByUser(req.user.userId);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  updateStatus(@Param('id') answerId: string, @Body('status') status: ContentStatus) {
    const safeStatus = (status || 'ACTIVE').toString().toUpperCase() as ContentStatus;
    return this.answersService.updateStatus(answerId, safeStatus);
  }
}
