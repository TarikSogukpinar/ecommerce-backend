import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../../database/database.service';
import { UnauthorizedAccessException } from '../handler/expcetions/custom-expection';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  async verifyToken(token: string) {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const decoded = await this.jwtService.verify(token, { secret });

      const isBlacklisted = await this.isTokenBlacklisted(token);

      if (isBlacklisted) throw new UnauthorizedAccessException();

      return decoded;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async createPasswordResetToken(user: User) {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const passwordResetExpiresIn = this.configService.get<string>(
        'PASSWORD_RESET_EXPIRES_IN',
      );
      return this.jwtService.sign(
        { email: user.email, id: user.id, type: 'passwordReset' },
        { secret, expiresIn: passwordResetExpiresIn },
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async createAccessToken(user: User) {
    try {
      const payload = {
        id: user.id,
      };
      return this.jwtService.sign(payload, {
        noTimestamp: true,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async createRefreshToken(user: User) {
    try {
      const payload = { email: user.email };
      return this.jwtService.sign(payload, {
        noTimestamp: true,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async updateRefreshToken(user: User, token: string) {
    try {
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { refreshToken: token },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    let userEmail;
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      userEmail = decoded.email;

      const user = await this.prismaService.user.findUnique({
        where: { email: userEmail },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedAccessException();
      }

      return this.createAccessToken(user);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async blacklistToken(token: string): Promise<void> {
    try {
      const decodedToken = await this.jwtService.decode(token);
      const expiresAt = new Date(decodedToken.exp * 1000);

      await this.prismaService.blacklistedToken.create({
        data: { token, expiresAt },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklisted = await this.prismaService.blacklistedToken.findUnique({
        where: { token },
      });

      return !!blacklisted;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }
}
