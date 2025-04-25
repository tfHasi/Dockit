import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Message text cannot be empty' })
  @MaxLength(500, { message: 'Message text cannot exceed $constraint1 characters' })
  text: string;
}
