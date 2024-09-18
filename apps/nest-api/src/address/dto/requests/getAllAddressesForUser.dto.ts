import { IsString } from 'class-validator';

export class GetAllAddressesForUserDto {
  @IsString()
  userId: string;
}
