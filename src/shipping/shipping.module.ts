import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Movement } from '../movement/entities/movement.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Inventory, Movement])],
    controllers: [ShippingController],
    providers: [ShippingService],
})
export class ShippingModule {}
