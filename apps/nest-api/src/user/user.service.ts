import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  InvalidCredentialsException,
  UserNotFoundException,
} from 'src/core/handler/expcetions/custom-expection';
import { PrismaService } from 'src/database/database.service';
import { GetAllUsersPaginationDto } from './dto/getAllUsersPagination.dto';
import { GetAllUsersResponseDto } from './dto/getAllUsersResponse.dto';
import { User } from '@prisma/client';
import { HashingService } from 'src/utils/hashing/hashing.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
  ) {}

  async getAllUsers(
    paginationParams: GetAllUsersPaginationDto,
  ): Promise<GetAllUsersResponseDto> {
    try {
      const { page, limit } = paginationParams;
      const offset = (page - 1) * limit;

      const [users, totalUsers] = await Promise.all([
        this.prismaService.user.findMany({
          skip: offset,
          take: limit,
          select: {
            uuid: true,
            email: true,
            role: true,
            name: true,
          },
        }),
        this.prismaService.user.count(),
      ]);

      if (users.length === 0) throw new UserNotFoundException();

      const response = {
        users: users.map((user) => ({
          ...user,
          ProfileImage: undefined,
        })),
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        totalUsers,
      };

      return response;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async saveResetToken(
    userId: string,
    resetToken: string,
    resetTokenExpires: Date,
  ): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { resetToken, resetTokenExpires },
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: { resetToken: token },
    });
  }

  async clearResetToken(userId: string): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { resetToken: null, resetTokenExpires: null },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.prismaService.user.findFirst({
      where: { resetToken: token },
    });

    if (
      !user ||
      !user.resetTokenExpires ||
      user.resetTokenExpires < new Date()
    ) {
      throw new InvalidCredentialsException();
    }

    const hashedPassword = await this.hashingService.hashPassword(newPassword);
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });
  }
}
