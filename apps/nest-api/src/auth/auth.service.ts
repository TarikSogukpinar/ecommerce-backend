import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { TokenService } from '../core/token/token.service';
import { RegisterResponseDto } from './dto/responses/registerResponse.dto';
import { User } from '@prisma/client';
import { LoginUserDto } from './dto/requests/loginUser.dto';
import { ErrorCodes } from 'src/core/handler/error/error-codes';
import { RegisterUserDto } from './dto/requests/registerUser.dto';
import { LoginResponseDto } from './dto/responses/loginResponse.dto';
import { HashingService } from 'src/utils/hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { LogoutResponseDto } from './dto/responses/logoutResponse.dto';
import * as requestIp from 'request-ip';
import { Request } from 'express';
import { ClientProxy, EventPattern } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
    @Inject('USER_SERVICE') private readonly client: ClientProxy,
  ) {}

  async registerUserService(
    registerUserDto: RegisterUserDto,
  ): Promise<RegisterResponseDto> {
    try {
      const { name, email, password } = registerUserDto;

      const existingUser = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException(ErrorCodes.UserAlreadyExists);
      }

      const hashedPassword = await this.hashingService.hashPassword(password);

      const user = await this.prismaService.user.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
          role: 'USER',
        },
      });

      return { uuid: user.id, email: user.email, role: user.role };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  @EventPattern('token_created')
  async loginUserService(
    loginUserDto: LoginUserDto,
  ): Promise<LoginResponseDto> {
    try {
      const { email } = loginUserDto;

      let user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await this.prismaService.user.create({
          data: {
            email,
            role: 'USER',
          },
        });
      }
      const accessToken = await this.tokenService.createAccessToken(user);
      const refreshToken = await this.tokenService.createRefreshToken(user);

      // Update user with the access token (optional)
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { accessToken: accessToken },
      });

      return {
        accessToken,
        refreshToken,
        email: user.email,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async logoutUserService(
    userId: string,
    token: string,
  ): Promise<LogoutResponseDto> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(ErrorCodes.UserNotFound);
      }

      await this.prismaService.user.update({
        where: { id: userId },
        data: { accessToken: null, refreshToken: null },
      });

      await this.tokenService.blacklistToken(token);

      return { message: 'User logged out successfully' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async refreshTokenService(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    try {
      const accessToken =
        await this.tokenService.refreshAccessToken(refreshToken);
      return { accessToken };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async validateOAuthLoginEmail(
    email: string,
    provider: string,
  ): Promise<User> {
    let user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prismaService.user.create({
        data: {
          email,
          password: '',
          role: 'USER',
        },
      });
    }

    return user;
  }

  async validateOAuthLogin(profile: {
    email: string;
    provider: string;
  }): Promise<string> {
    const { email, provider } = profile;

    if (!email) {
      throw new Error('Email not found');
    }

    const user = await this.validateOAuthLoginEmail(email, provider);

    const payload = { email: user.email, sub: user.id, role: user.role };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  async createSession(userId: string, token: string, req: Request) {
    try {
      const clientIp = requestIp.getClientIp(req);
      const userAgent = req.headers['user-agent'] || 'unknown';

      const expiresIn = 24 * 60 * 60 * 1000; // 24 saat
      const expiresAt = new Date(Date.now() + expiresIn);

      const createSession = await this.prismaService.session.create({
        data: {
          userId,
          token,
          ipAddress: clientIp,
          userAgent,
          expiresAt,
          isActive: true,
        },
      });
      return createSession;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async terminateSession(userId: string, token: string) {
    try {
      const session = await this.prismaService.session.findFirst({
        where: {
          userId,
          token,
          isActive: true,
        },
      });

      if (!session) {
        throw new NotFoundException(ErrorCodes.InvalidSessions);
      }

      const terminatedSession = await this.prismaService.session.update({
        where: { id: session.id },
        data: { isActive: false },
      });

      return terminatedSession;
    } catch (error) {
      console.error('Error terminating session:', error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async getUserSessions(userId: string) {
    try {
      const sessions = await this.prismaService.session.findMany({
        where: { userId, isActive: true },
        select: {
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          expiresAt: true,
        },
      });
      return sessions;
    } catch (error) {
      console.error('Error terminating session:', error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }
}
