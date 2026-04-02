import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './user/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get(getRepositoryToken(User));

  const adminEmail = 'admin@wms.com';
  const existingAdmin = await userRepository.findOneBy({ email: adminEmail });

  if (!existingAdmin) {
    console.log('Admin user not found. Seeding...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      firstName: 'System',
      lastName: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });
    await userRepository.save(admin);
    console.log('Admin user seeded: admin@wms.com / admin123');
  } else {
    console.log('Admin user already exists.');
  }

  await app.close();
}

seed();
