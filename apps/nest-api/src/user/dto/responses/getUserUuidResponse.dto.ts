import { Role } from '@prisma/client';

export type GetUserUUIDResponseDto = {
  uuid: string;
  name: string;
  email: string;
  imageUrl?: string;
  isActiveAccount: boolean;
  role: Role;
  createdAt: string;
  updatedAt: string;
};
