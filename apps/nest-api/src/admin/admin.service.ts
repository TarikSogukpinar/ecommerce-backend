import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/database/database.service';
import { GetAllTicketsResponseDto } from './dto/responses/getAllTicketsResponse.dto';
import { TicketNotFoundException } from 'src/core/handler/expcetions/custom-expection';
import { UpdateTicketResponseDto } from './dto/responses/updateTicketStatusResponse.dto';
import { DeleteTicketResponseDto } from './dto/responses/deleteTicketResponse.dto';
import { DeleteTicketParamDto } from './dto/requests/deleteTicketParam.dto';
import { UpdateTicketStatusParamDto } from './dto/requests/updateTicketStatusParam.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllTickets(): Promise<GetAllTicketsResponseDto[]> {
    try {
      const getAllTickets = await this.prismaService.supportTicket.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      if (!getAllTickets || getAllTickets.length === 0)
        throw new TicketNotFoundException();

      return getAllTickets.map((ticket) => ({
        id: ticket.id,
        subject: ticket.subject,
        content: ticket.description,
        status: ticket.status,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        user: {
          id: ticket.user.id,
          email: ticket.user.email,
          name: ticket.user.name,
        },
      }));
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error retrieving tickets. Please try again later.',
      );
    }
  }

  async updateTicketStatus(
    updateTicketStatusParamDto: UpdateTicketStatusParamDto,
  ): Promise<UpdateTicketResponseDto> {
    try {
      const ticket = await this.prismaService.supportTicket.findUnique({
        where: { id: updateTicketStatusParamDto.ticketId },
      });

      if (!ticket) throw new TicketNotFoundException();

      const updatedTicket = await this.prismaService.supportTicket.update({
        where: { id: updateTicketStatusParamDto.ticketId },
        data: { status: updateTicketStatusParamDto.status },
      });

      return {
        id: updatedTicket.id,
        status: updatedTicket.status,
        updatedAt: updatedTicket.updatedAt,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error updating ticket status. Please try again later.',
      );
    }
  }

  async deleteTicket(
    deleteTicketParamDto: DeleteTicketParamDto,
  ): Promise<DeleteTicketResponseDto> {
    try {
      const ticket = await this.prismaService.supportTicket.findUnique({
        where: { id: deleteTicketParamDto.ticketId },
      });

      if (!ticket) throw new TicketNotFoundException();

      await this.prismaService.supportTicket.delete({
        where: { id: deleteTicketParamDto.ticketId },
      });

      return {
        message: `Ticket with ID ${deleteTicketParamDto.ticketId} successfully deleted.`,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error deleting ticket. Please try again later.',
      );
    }
  }
}
