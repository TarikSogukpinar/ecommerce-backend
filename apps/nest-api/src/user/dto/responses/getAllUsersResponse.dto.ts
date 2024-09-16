export type GetAllUsersUser = {
  uuid: string;
  name: string;
  email: string;
};

export type GetAllUsersResponseDto = {
  users: GetAllUsersUser[];
  totalPages: number;
  currentPage: number;
  totalUsers: number;
};
