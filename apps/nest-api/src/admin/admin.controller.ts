import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { AdminService } from './admin.service';
import { TicketStatus } from '@prisma/client';

@Controller({ path: 'admin', version: '1' })
@ApiTags('Admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('getAllTickets')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAllTickets() {
    const result = this.adminService.getAllTickets();

    return {
      message: 'Successfully fetched all tickets',
      result,
    };
  }

  @Put('updateTicket/:ticketId')
  async updateTicketStatus(
    @Param('id') ticketId: string,
    @Body('status') status: TicketStatus,
  ) {
    return this.adminService.updateTicketStatus(ticketId, status);
  }

  @Delete('deleteTicket/:id')
  async deleteTicket(@Param('id') ticketId: string) {
    return this.adminService.deleteTicket(ticketId);
  }
}
