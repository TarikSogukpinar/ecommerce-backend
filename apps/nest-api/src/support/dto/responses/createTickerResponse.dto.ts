import { TicketStatus } from '@prisma/client';

export type CreateTicketResponseDto = {
  subject: string;
  status: TicketStatus;
};
