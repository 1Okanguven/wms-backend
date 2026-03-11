import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovementService } from './movement.service';
import { MovementController } from './movement.controller';
import { Movement } from './entities/movement.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movement, Inventory])],
  controllers: [MovementController],
  providers: [MovementService],
})
export class MovementModule { }