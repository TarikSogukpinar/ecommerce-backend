import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/database.module';
import { HashingService } from 'src/utils/hashing/hashing.service';
import { UploadService } from 'src/utils/upload/upload.service';
import { ImageProcessingService } from 'src/utils/image/image-process.service';
import { MailService } from 'src/core/mail/mail.service';
import { PasswordResetService } from 'src/core/password-reset/password-reset.service';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    UserService,
    HashingService,
    UploadService,
    ImageProcessingService,
    MailService,
    PasswordResetService,
  ],
  exports: [UserService],
})
export class UsersModule {}
