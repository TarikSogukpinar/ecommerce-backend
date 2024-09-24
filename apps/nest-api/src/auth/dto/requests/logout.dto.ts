import { IsUUID, IsString } from 'class-validator';

export class LogoutParamsDto {
  @IsUUID()
  userId: string;

  @IsString()
  token: string;
}
export class BlackListTokenLogoutDto {
  @IsString()
  token: string;
}
