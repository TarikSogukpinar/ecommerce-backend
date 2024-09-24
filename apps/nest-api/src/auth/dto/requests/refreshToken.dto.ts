import { IsString } from 'class-validator';

export class RefreshTokenParamsDto {
  @IsString()
  refreshToken: string;
}
