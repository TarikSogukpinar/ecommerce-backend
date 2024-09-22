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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { AdminService } from './admin.service';
import { TicketStatus } from '@prisma/client';

@Controller({ path: 'admin', version: '1' })
@ApiTags('Admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('getAllTickets')
  @ApiOperation({ summary: 'Get all tickets' })
  @ApiResponse({
    status: 200,
    description: 'All tickets fetched successfully',
  })
  @ApiBody({ type: String })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAllTickets() {
    const result = await this.adminService.getAllTickets();

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
    return await this.adminService.updateTicketStatus(ticketId, status);
  }

  @Delete('deleteTicket/:id')
  async deleteTicket(@Param('id') ticketId: string) {
    return await this.adminService.deleteTicket(ticketId);
  }
}
