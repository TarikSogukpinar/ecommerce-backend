import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TicketStatus } from '@prisma/client';

export class GetMyTicketsDto {
  @IsOptional()
  @IsEnum(TicketStatus, { message: 'Status must be PENDING, OPEN, or CLOSED' })
  status?: TicketStatus;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate?: string;
}
