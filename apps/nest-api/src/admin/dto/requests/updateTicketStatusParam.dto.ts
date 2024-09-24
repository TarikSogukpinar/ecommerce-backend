import { TicketStatus } from '@prisma/client';
import { IsString } from 'class-validator';

export class UpdateTicketStatusParamDto {
  @IsString()
  ticketId: string;

  @IsString()
  status: TicketStatus;
}
