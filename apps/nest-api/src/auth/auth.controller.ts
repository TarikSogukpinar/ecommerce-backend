import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/requests/loginUser.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CustomRequest } from '../core/request/customRequest';
import { RegisterUserDto } from './dto/requests/registerUser.dto';
import { LogoutDto } from './dto/requests/logout.dto';
import { ErrorCodes } from 'src/core/handler/error/error-codes';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guard/auth.guard';
import { ClientProxy } from '@nestjs/microservices';

@Controller({ path: 'auth', version: '1' })
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
  private readonly redirectUrl: string;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    @Inject('USER_SERVICE') private readonly client: ClientProxy,
  ) {
    this.redirectUrl = this.configService.get<string>('REDIRECT_URL');
  }

  @Post('register')
  @ApiOperation({ summary: 'User register' })
  @ApiResponse({
    status: 200,
    description: 'Successful register',
    type: RegisterUserDto,
  })
  @ApiBody({ type: RegisterUserDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async register(@Body() registerUserDto: RegisterUserDto) {
    const result = await this.authService.registerUserService(registerUserDto);

    return {
      message: 'Successfully register user!',
      result,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    type: LoginUserDto,
  })
  @ApiBody({ type: LoginUserDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    const result = await this.authService.loginUserService(loginUserDto);

    this.client.emit('token_created', {
      result,
    });

    return {
      message: 'Successfully login user!',
      result,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout User' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logout',
  })
  @ApiBody({ type: LogoutDto })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: CustomRequest) {
    const userId = req.user?.id;
    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.split(' ')[1] : null;

    if (!userId) {
      throw new UnauthorizedException(ErrorCodes.InvalidCredentials);
    }

    if (!token) {
      throw new UnauthorizedException(ErrorCodes.InvalidCredentials);
    }

    const result = await this.authService.logoutUserService(userId, token);
    return { message: 'Logout successful', result };
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Refresh access token' })
  @ApiBody({ type: String })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    const result = await this.authService.refreshTokenService(refreshToken);
    return { message: 'Token refreshed', result };
  }
}
