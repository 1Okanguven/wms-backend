import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

import { Product } from '../product/entities/product.entity';
import { Movement } from '../movement/entities/movement.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Zone } from '../zone/entities/zone.entity';
import { Rack } from '../rack/entities/rack.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Movement, Inventory, Zone, Rack])],
  providers: [DashboardService],
  controllers: [DashboardController]
})
export class DashboardModule { }