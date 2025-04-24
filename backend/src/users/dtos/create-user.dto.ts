import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  nickname: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}