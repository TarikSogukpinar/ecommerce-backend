import { TicketStatus } from '@prisma/client';

export type GetMyTicketResponseDto = {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
};
