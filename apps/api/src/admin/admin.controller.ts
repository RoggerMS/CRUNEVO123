import { Controller, Get, Post, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers(@Query('search') search?: string) {
    return this.adminService.getUsers(search);
  }

  @Post('users/:id/ban')
  toggleBan(@Param('id') id: string, @Body('isBanned') isBanned: boolean) {
    return this.adminService.toggleBan(id, isBanned);
  }

  @Post('users/:id/stats')
  updateUserStats(
    @Param('id') id: string,
    @Body('points') points: number,
    @Body('level') level: number,
  ) {
    return this.adminService.updateUserStats(id, points, level);
  }

  @Get('reports')
  getReports() {
    return this.adminService.getReports();
  }

  @Post('users/:id/verify-teacher')
  verifyTeacher(@Param('id') id: string) {
    return this.adminService.verifyTeacher(id);
  }

  @Post('users/:id/role')
  changeRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.adminService.changeRole(id, role);
  }

  @Get('content/:type')
  getContent(
    @Param('type') type: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('q') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getContent(type, page, limit, search, status);
  }

  @Post('content/:type/:id/status')
  updateContentStatus(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateContentStatus(type, id, status);
  }

  @Delete('content/:type/:id')
  deleteContent(@Param('type') type: string, @Param('id') id: string) {
    return this.adminService.deleteContent(type, id);
  }
}
