import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Inventory } from './entities/inventory.entity';
import { Movement } from '../movement/entities/movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Movement])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule { }