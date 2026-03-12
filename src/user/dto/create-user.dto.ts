import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: UserRole;
}