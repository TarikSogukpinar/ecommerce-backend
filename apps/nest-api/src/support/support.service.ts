import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/database.service';
import { CreateTicketDto } from './dto/requests/createTicket.dto';
import { CreateTicketResponseDto } from './dto/responses/createTickerResponse.dto';
import { GetMyTicketsDto } from './dto/requests/getMyTickets.dto';
import { GetMyTicketResponseDto } from './dto/responses/getMyTicketResponse.dto';
import { TicketDetailsResponseDto } from './dto/responses/getTicketDetailsResponse.dto';
import { TicketNotFoundException } from 'src/core/handler/expcetions/custom-expection';
import { GetTicketDetailsParamsDto } from './dto/requests/getTicketDetailsParams.dto';

@Injectable()
export class SupportService {
  constructor(private readonly prismaService: PrismaService) {}

  async createTicket(
    createTicketDto: CreateTicketDto,
    userId: string,
  ): Promise<CreateTicketResponseDto> {
    const createTicket = await this.prismaService.supportTicket.create({
      data: {
        userId,
        subject: createTicketDto.subject,
        description: createTicketDto.description,
        status: 'PENDING',
      },
    });

    return createTicket;
  }

  async getMyTickets(
    userId: string,
    query: GetMyTicketsDto,
  ): Promise<GetMyTicketResponseDto[]> {
    const { status, startDate, endDate } = query;

    const whereClause: any = {
      userId,
    };

    if (status) {
      whereClause.status = status;
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prismaService.supportTicket.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTicketDetails(
    getTicketDetailsParamsDto: GetTicketDetailsParamsDto,
  ): Promise<TicketDetailsResponseDto> {
    const getTicketDetails = await this.prismaService.supportTicket.findFirst({
      where: {
        id: getTicketDetailsParamsDto.ticketId,
        userId: getTicketDetailsParamsDto.userId,
      },
    });

    if (!getTicketDetails) throw new TicketNotFoundException();

    return {
      id: getTicketDetails.id,
      userId: getTicketDetails.userId,
      subject: getTicketDetails.subject,
      description: getTicketDetails.description,
      status: getTicketDetails.status,
      createdAt: getTicketDetails.createdAt,
      updatedAt: getTicketDetails.updatedAt,
    };
  }
}
