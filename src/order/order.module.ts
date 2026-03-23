import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { PickList } from './entities/pick-list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, PickList])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
