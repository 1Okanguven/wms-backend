import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { PickList } from './entities/pick-list.entity';
import { PickItem } from './entities/pick-item.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Movement } from '../movement/entities/movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, PickList, PickItem, Inventory, Movement])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
