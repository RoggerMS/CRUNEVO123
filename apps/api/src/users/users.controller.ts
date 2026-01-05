import { Controller, Get, Patch, Body, UseGuards, Request, Param, NotFoundException, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  search(@Query('q') q: string) {
    return this.usersService.search(q);
  }

  @Get('me')
  getProfile(@Request() req: any) {
    // req.user has userId from jwt strategy
    return this.usersService.findById(req.user.userId);
  }

  @Patch('me')
  updateProfile(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Get(':id/profile')
  async getPublicProfile(@Param('id') id: string) {
    const profile = await this.usersService.getProfile(id);
    if (!profile) throw new NotFoundException('User not found');
    return profile;
  }
}
