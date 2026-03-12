import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {

    const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi sistemde zaten kayıtlı!');
    }


    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);


    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);

    //GÜVENLİK: Şifreyi API yanıtından (response) çıkar ki dışarı sızmasın!
    const { password, ...result } = savedUser;
    return result;
  }

  findAll() {
    return this.userRepository.find({
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt']
    });
  }

  findById(id: string) {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt']
    });
  }

  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}