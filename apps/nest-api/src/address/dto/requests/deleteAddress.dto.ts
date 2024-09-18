import { IsUUID, IsNotEmpty } from 'class-validator';

export class DeleteAddressDto {
  @IsNotEmpty()
  addressId: string;

  @IsNotEmpty()
  userId: string;
}