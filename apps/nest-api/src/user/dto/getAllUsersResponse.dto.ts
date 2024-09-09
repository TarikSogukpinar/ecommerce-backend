import { Type } from 'class-transformer';
import {
  IsUUID,
  IsEmail,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';

export class GetAllUsersUserDto {
  @IsUUID()
  uuid: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;
}

export class GetAllUsersResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetAllUsersUserDto)
  users: GetAllUsersUserDto[];

  @IsNumber()
  totalPages: number;

  @IsNumber()
  currentPage: number;

  @IsNumber()
  totalUsers: number;
}
