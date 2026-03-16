import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

import { Product } from '../product/entities/product.entity';
import { Movement } from '../movement/entities/movement.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Movement, Inventory])],
  providers: [DashboardService],
  controllers: [DashboardController]
})
export class DashboardModule { }