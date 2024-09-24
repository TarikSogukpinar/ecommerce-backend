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
import { DeleteTicketParamDto } from './dto/requests/deleteTicketParam.dto';
import { UpdateTicketStatusParamDto } from './dto/requests/updateTicketStatusParam.dto';

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
  @ApiOperation({ summary: 'Update ticket status' })
  @ApiResponse({
    status: 200,
    description: 'Ticket status updated successfully',
  })
  @ApiBody({ type: String })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateTicketStatus(
    @Param() UpdateTicketStatusParamDto: UpdateTicketStatusParamDto,
  ) {
    const result = await this.adminService.updateTicketStatus(
      UpdateTicketStatusParamDto,
    );

    return {
      message: 'Successfully updated ticket status',
      result,
    };
  }

  @Delete('deleteTicket/:id')
  @ApiOperation({ summary: 'Delete ticket' })
  @ApiResponse({
    status: 200,
    description: 'Ticket deleted successfully',
  })
  @ApiBody({ type: String })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteTicket(@Param() deleteTicketParamDto: DeleteTicketParamDto) {
    const result = await this.adminService.deleteTicket(deleteTicketParamDto);

    return {
      message: 'Successfully deleted ticket',
      result,
    };
  }
}
