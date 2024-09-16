import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty({ message: 'Email required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  email: string;

}
