import { IsString, IsUUID } from 'class-validator';

export class GetTicketDetailsParamsDto {
  @IsString()
  ticketId: string;

  @IsString()
  userId: string;
}
