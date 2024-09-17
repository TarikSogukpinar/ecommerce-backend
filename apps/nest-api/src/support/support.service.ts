import { Injectable } from '@nestjs/common';

@Injectable()
export class SupportService {
  constructor() {}

  async createSupportTicket() {
    return 'Support ticket created!';
  }
}
