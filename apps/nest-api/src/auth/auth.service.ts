import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { TokenService } from '../core/token/token.service';
import { RegisterResponseDto } from './dto/responses/registerResponse.dto';
import { LoginUserDto } from './dto/requests/loginUser.dto';
import { RegisterUserDto } from './dto/requests/registerUser.dto';
import { LoginResponseDto } from './dto/responses/loginResponse.dto';
import { HashingService } from 'src/utils/hashing/hashing.service';
import { LogoutResponseDto } from './dto/responses/logoutResponse.dto';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import {
  UserAlreadyExistsException,
  UserNotFoundException,
} from 'src/core/handler/expcetions/custom-expection';
import { LogoutParamsDto } from './dto/requests/logout.dto';
import { RefreshTokenParamsDto } from './dto/requests/refreshToken.dto';
import { RefreshTokenResponseDto } from './dto/responses/refreshTokenResponse.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,

    @Inject('USER_SERVICE') private readonly client: ClientProxy,
  ) { }

  async registerUserService(
    registerUserDto: RegisterUserDto,
  ): Promise<RegisterResponseDto> {
    try {
      const { name, email, password } = registerUserDto;

      const existingUser = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (existingUser) throw new UserAlreadyExistsException();

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
    logoutParamsDto: LogoutParamsDto,
  ): Promise<LogoutResponseDto> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: logoutParamsDto.userId },
      });

      if (!user) throw new UserNotFoundException();

      await this.prismaService.user.update({
        where: { id: logoutParamsDto.userId },
        data: { accessToken: null, refreshToken: null },
      });

      await this.tokenService.blacklistToken(logoutParamsDto.token);

      return { message: 'User logged out successfully' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async refreshTokenService(
    refreshTokenParamsDto: RefreshTokenParamsDto,
  ): Promise<RefreshTokenResponseDto> {
    try {
      const accessToken = await this.tokenService.refreshAccessToken(
        refreshTokenParamsDto.refreshToken,
      );
      return { accessToken };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }
}
