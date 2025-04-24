import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  nickname: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}