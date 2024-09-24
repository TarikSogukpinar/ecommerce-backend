export type GetAllTicketsResponseDto = {
  id: string;
  subject: string;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    name: string;
  };
};
