import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
  }

  async seedAdmin() {
    const adminEmail = 'admin@wms.com';
    const existingAdmin = await this.userRepository.findOneBy({ email: adminEmail });

    if (!existingAdmin) {
      this.logger.log('No admin user found. Creating default admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = this.userRepository.create({
        firstName: 'System',
        lastName: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      });
      await this.userRepository.save(admin);
      this.logger.log(`Admin user seeded: ${adminEmail} / admin123`);
    } else {
      this.logger.log('Admin user check passed.');
    }
  }
}
