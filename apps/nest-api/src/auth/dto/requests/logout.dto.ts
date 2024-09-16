import { IsNumber, IsString } from 'class-validator';

export class LogoutDto {
  @IsNumber()
  userId: string;
}

export class BlackListTokenLogoutDto {
  @IsString()
  token: string;
}
