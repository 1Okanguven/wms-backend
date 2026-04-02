import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';

async function check() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get(getRepositoryToken(User));
  const users = await userRepository.find();
  console.log('USER_COUNT:', users.length);
  users.forEach(u => console.log(`USER: ${u.email} (${u.role})`));
  await app.close();
}

check();
