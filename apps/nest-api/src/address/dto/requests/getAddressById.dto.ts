import { IsString, IsTaxId } from 'class-validator';

export class GetAddressByIdDto {
  @IsString()
  addressId: string;
  
  @IsString()
  userId: string;
}
