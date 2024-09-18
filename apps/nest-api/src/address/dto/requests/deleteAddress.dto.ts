import { IsUUID, IsNotEmpty } from 'class-validator';

export class DeleteAddressDto {
  @IsUUID() 
  @IsNotEmpty()
  addressId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}