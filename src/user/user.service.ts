import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    if (createUserDto.role === UserRole.WORKER && !createUserDto.warehouseId) {
      throw new BadRequestException('Worker rolündeki bir kullanıcı için depo (warehouseId) zorunludur!');
    }

    if (createUserDto.role === UserRole.ADMIN) {
      createUserDto.warehouseId = null as any;
    }

    const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi sistemde zaten kayıtlı!');
    }

    let hashedPassword = '';
    if (createUserDto.password) {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    } else {
      hashedPassword = await bcrypt.hash('123456', 10); // Default password fallback or you can handle differently
    }

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);
    const { password, ...result } = savedUser;
    return result;
  }

  findAll() {
    return this.userRepository.find({
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt', 'warehouseId'],
      relations: ['warehouse']
    });
  }

  findById(id: string) {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt', 'warehouseId'],
      relations: ['warehouse']
    });
  }

  findByEmail(email: string, relations: string[] = []) {
    return this.userRepository.findOne({ 
      where: { email },
      relations
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new BadRequestException('Kullanıcı bulunamadı');

    const newRole = updateUserDto.role || user.role;
    let newWarehouseId = updateUserDto.warehouseId !== undefined ? updateUserDto.warehouseId : user.warehouseId;
    
    if (newRole === UserRole.WORKER && !newWarehouseId) {
      throw new BadRequestException('Worker rolündeki bir kullanıcı için depo (warehouseId) zorunludur!');
    }

    if (newRole === UserRole.ADMIN) {
      newWarehouseId = null as any;
      updateUserDto.warehouseId = null as any;
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    await this.userRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async remove(id: string) {
    await this.userRepository.delete(id);
    return { deleted: true };
  }
}