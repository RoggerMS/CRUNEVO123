import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Request() req: any, @Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(req.user.userId, createReportDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.reportsService.findAll();
  }
}
