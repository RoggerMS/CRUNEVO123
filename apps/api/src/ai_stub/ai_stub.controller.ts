import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ai')
@Controller('ai')
export class AiStubController {
  @Get('status')
  getStatus() {
    return { enabled: false, message: "coming soon" };
  }
}
