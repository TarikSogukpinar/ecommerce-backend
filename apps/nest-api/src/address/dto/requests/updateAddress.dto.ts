import { IsString, MinLength } from 'class-validator';

export class UpdateAddressDto {
  @IsString()
  @MinLength(2)
  addressLine: string;

  @IsString()
  @MinLength(2)
  city: string;

  @IsString()
  @MinLength(2)
  state: string;

  @IsString()
  @MinLength(2)
  postalCode: string;

  @IsString()
  @MinLength(2)
  country: string;
}
