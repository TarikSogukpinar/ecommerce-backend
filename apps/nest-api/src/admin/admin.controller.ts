import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller({ path: 'admin', version: '1' })
@ApiTags('Admin')
export class AdminController {
  constructor() {}

  @Get('getAllTickets')
  async getAllTickets() {
    return 'All tickets';
  }
}
