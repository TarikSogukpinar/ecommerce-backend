import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller({ path: 'support', version: '1' })
@ApiTags('Support')
export class SupportController {
  constructor() {}

  @Post('createSupportTicket')
  async createSupportTicket() {
    return 'Support ticket created!';
  }
}
