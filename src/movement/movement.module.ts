import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovementService } from './movement.service';
import { MovementController } from './movement.controller';
import { Movement } from './entities/movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movement])],
  controllers: [MovementController],
  providers: [MovementService],
})
export class MovementModule { }