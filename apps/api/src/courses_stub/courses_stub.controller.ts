import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('courses')
@Controller('courses')
export class CoursesStubController {
  @Get()
  findAll() {
    return [];
  }
  
  @Get(':id')
  findOne() {
    return { message: "Course details coming soon" };
  }
}
