import {
  IsUUID,
  IsEmail,
  IsString,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Role } from '@prisma/client'; // Assuming you have Role enum in Prisma

export class GetUserUUIDResponseDto {
  @IsUUID()
  uuid: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional() // In case imageUrl can be null
  imageUrl?: string;

  @IsBoolean()
  isActiveAccount: boolean;

  @IsString()
  role: Role; // This is based on the enum in Prisma

  @IsString() // These could also be Date if you want to return them as date objects
  createdAt: string;

  @IsString()
  updatedAt: string;
}
