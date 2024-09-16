import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
  NotFoundException,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
  UploadedFile,
  Patch,
  Query,
} from '@nestjs/common';
import { CustomRequest } from 'src/core/request/customRequest';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/requests/updateUser.dto';
import { ChangePasswordDto } from './dto/requests/changePassword.dto';
import { ErrorCodes } from 'src/core/handler/error/error-codes';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/utils/upload/upload.service';
import { MailService } from 'src/core/mail/mail.service';
import { PasswordResetService } from 'src/core/password-reset/password-reset.service';
import { GetAllUsersPaginationDto } from './dto/requests/getAllUsersPagination.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from './guards/auth.guard';
import { GetUserByUuidDto } from './dto/requests/getUserUuid.dto';
import { InvalidUUIDException } from 'src/core/handler/expcetions/custom-expection';
import { OptionalJwtAuthGuard } from './guards/optionalAuth.guard';

@Controller({ path: 'user', version: '1' })
@ApiTags('Users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
    private readonly mailService: MailService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @Get('users')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getAllUsers(@Query() paginationParams: GetAllUsersPaginationDto) {
    const result = await this.userService.getAllUsers(paginationParams);

    return { message: 'Users retrieved successfully', result };
  }

  @Get('me')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Req() req: CustomRequest) {
    const userUuid = req.user?.uuid;

    if (!userUuid) {
      throw new NotFoundException(ErrorCodes.InvalidCredentials);
    }

    const result = await this.userService.getUserByUuid(userUuid);

    if (!result) throw new NotFoundException(ErrorCodes.UserNotFound);

    return { message: 'User Information retrieved successfully', result };
  }
  
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async getUserById(
    @Param() getUserByUuidDto: GetUserByUuidDto,
    @Req() req: CustomRequest,
  ) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(ErrorCodes.InvalidCredentials);
    }

    const user = await this.userService.getUserByUuid(getUserByUuidDto.id);

    if (!user) {
      throw new NotFoundException(ErrorCodes.UserNotFound);
    }

    return user;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: CustomRequest,
  ) {
    const result = await this.userService.updateUser(id, updateUserDto);
    return {
      message: 'User updated successfully',
      result,
    };
  }

  @Put(':id/password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: CustomRequest,
  ) {
    const userUuid = req.user?.uuid;

    if (!userUuid) {
      throw new UnauthorizedException('You can only change your own password');
    }

    return this.userService.changePassword(userUuid, changePasswordDto);
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: CustomRequest,
  ) {
    const userUuid = req.user?.uuid;
    if (!userUuid) {
      throw new Error('User UUID not found');
    }
    const imagePath = await this.uploadService.uploadProfileImage(
      file,
      userUuid,
    );

    await this.userService.updateProfileImage(userUuid, imagePath);

    return { imageUrl: imagePath };
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string): Promise<void> {
    await this.passwordResetService.sendPasswordResetLink(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ): Promise<void> {
    await this.userService.resetPassword(token, newPassword);
  }

  @Patch('deactivate-account')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Account deactivated successfully' })
  @ApiOperation({ summary: 'Deactivate account' })
  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  async deactivateAccount(@Req() req: CustomRequest) {
    const userUuid = req.user?.uuid;

    if (!userUuid) throw new InvalidUUIDException();

    const result = await this.userService.updateUserAccountStatus(
      userUuid,
      false,
    );

    return {
      message: 'Account deactivated successfully',
      result,
    };
  }
}
