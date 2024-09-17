import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  constructor() {}

  async createAdmin() {
    return 'Admin created!';
  }
}
