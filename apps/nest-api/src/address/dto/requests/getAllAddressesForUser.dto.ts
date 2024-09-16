import { IsString, MinLength } from 'class-validator';

export class GetAllAddressesForUserDto {
  @IsString()
  userId: string;
}
