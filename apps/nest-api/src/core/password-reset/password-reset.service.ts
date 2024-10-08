import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';
import { UserService } from 'src/user/user.service';
import { UserNotFoundException } from '../handler/expcetions/custom-expection';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly mailService: MailService,
    private readonly userService: UserService,
  ) {}

  async sendPasswordResetLink(email: string): Promise<void> {
    const user = await this.userService.findUserByEmail(email);

    if (!user) throw new UserNotFoundException();

    const resetToken = uuidv4();
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour
    const resetUrl = `http://localhost:3010/api/v1/user/reset-password?token=${resetToken}`;

    await this.userService.saveResetToken(
      user.id,
      resetToken,
      resetTokenExpires,
    );

    // await this.mailService.sendMail(
    //   email,
    //   'Password Reset Request',
    //   `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
    //   `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetUrl}">Reset Password</a></p>`,
    // );
  }
}
