import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  AccountIsAlreadyDeactivatedException,
  InvalidCredentialsException,
  PassportCannotBeTheSameException,
  UserNotFoundException,
} from 'src/core/handler/expcetions/custom-expection';
import { PrismaService } from 'src/database/database.service';
import { GetAllUsersPaginationDto } from './dto/requests/getAllUsersPagination.dto';
import { GetAllUsersResponseDto } from './dto/responses/getAllUsersResponse.dto';
import { Prisma, User } from '@prisma/client';
import { HashingService } from 'src/utils/hashing/hashing.service';
import { ChangePasswordDto } from './dto/requests/changePassword.dto';
import { GetUserUUIDResponseDto } from './dto/responses/getUserUuidResponse.dto';
import { UpdateUserAccountStatusResponseDto } from './dto/responses/updateUserAccountStatusResponse.dto';

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
        await this.prismaService.user.findMany({
          skip: offset,
          take: limit,
          select: {
            uuid: true,
            email: true,
            role: true,
            name: true,
          },
        }),
        await this.prismaService.user.count(),
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

  async changePassword(
    uuid: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { uuid },
      include: {
        PasswordHistory: {
          orderBy: { createdAt: 'desc' },
          take: 2,
        },
      },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    const isMatchPassword = await this.hashingService.comparePassword(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isMatchPassword) throw new InvalidCredentialsException();

    for (const history of user.PasswordHistory) {
      const isOldPassword = await this.hashingService.comparePassword(
        changePasswordDto.newPassword,
        history.password,
      );
      if (isOldPassword) throw new PassportCannotBeTheSameException();
    }

    const hashedPassword = await this.hashingService.hashPassword(
      changePasswordDto.newPassword,
    );

    const updatedUser = await this.prismaService.user.update({
      where: { uuid },
      data: { password: hashedPassword },
    });

    await this.prismaService.passwordHistory.create({
      data: {
        userId: user.id,
        password: user.password,
      },
    });

    return updatedUser;
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const user = await this.prismaService.user.update({
      where: { id },
      data,
    });
    return user;
  }

  async updateProfileImage(userUuid: string, imagePath: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { uuid: userUuid },
    });
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.prismaService.profileImage.upsert({
      where: {
        userId: user.id,
        uuid: userUuid,
      },
      create: {
        userId: user.id,
        uuid: userUuid,
        imageUrl: imagePath,
      },
      update: {
        imageUrl: imagePath,
      },
    });

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { image: imagePath },
    });
  }

  async getUserByUuid(uuid: string): Promise<GetUserUUIDResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        email: true,
        role: true,
        name: true,
        isActiveAccount: true,
        createdAt: true,
        updatedAt: true,
        ProfileImage: {
          select: {
            imageUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    const imageUrl =
      user.ProfileImage?.length > 0 ? user.ProfileImage[0].imageUrl : null;

    const userDto: GetUserUUIDResponseDto = {
      uuid: user.uuid,
      email: user.email,
      name: user.name,
      role: user.role,
      isActiveAccount: user.isActiveAccount,
      imageUrl: imageUrl || '',
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return userDto;
  }

  async updateUserAccountStatus(
    userUuid: string,
    isActive: boolean,
  ): Promise<UpdateUserAccountStatusResponseDto> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { uuid: userUuid },
        select: {
          isActiveAccount: true,
        },
      });

      if (!user) throw new UserNotFoundException();

      if (user.isActiveAccount === isActive)
        throw new AccountIsAlreadyDeactivatedException();

      const result = await this.prismaService.user.update({
        where: { uuid: userUuid },
        data: { isActiveAccount: isActive },
      });

      return { isActiveAccount: result.isActiveAccount };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }
}
