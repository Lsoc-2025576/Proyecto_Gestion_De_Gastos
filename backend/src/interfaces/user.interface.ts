export interface IUser {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role?: string;
  created_at?: Date;
}