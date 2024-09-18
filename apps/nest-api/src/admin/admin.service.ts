import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/database.service';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllTickets(): Promise<any> {
    return this.prismaService.supportTicket.findMany({
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
  }

  async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
  ): Promise<any> {
    return this.prismaService.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
      },
    });
  }

  async deleteTicket(ticketId: string): Promise<any> {
    return this.prismaService.supportTicket.delete({
      where: { id: ticketId },
    });
  }
}
