import { TicketStatus } from '@prisma/client';

export type TicketDetailsResponseDto = {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
};
