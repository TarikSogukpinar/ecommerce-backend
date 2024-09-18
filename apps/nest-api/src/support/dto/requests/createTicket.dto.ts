import { TicketStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty({ message: 'Subject required' })
  @MinLength(2, { message: 'Subject must be at least 2 characters long' })
  subject: string;

  @IsString()
  @IsNotEmpty({ message: 'Subject required' })
  @MinLength(2, { message: 'Subject must be at least 2 characters long' })
  description: string;

  @IsEnum(TicketStatus, {
    message: 'Status must be either PENDING, OPEN, or CLOSED',
  })
  status: TicketStatus;
}
