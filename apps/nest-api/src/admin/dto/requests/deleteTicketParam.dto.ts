import { IsString, MinLength } from 'class-validator';

export class DeleteTicketParamDto {
  @IsString()
  ticketId: string;
}
