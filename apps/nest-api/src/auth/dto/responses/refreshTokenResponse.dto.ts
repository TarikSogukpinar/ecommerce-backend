import { IsString } from 'class-validator';

export class RefreshTokenResponseDto {
  @IsString()
  accessToken: string;
}
