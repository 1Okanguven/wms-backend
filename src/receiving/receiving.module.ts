import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceivingService } from './receiving.service';
import { ReceivingController } from './receiving.controller';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Movement } from '../movement/entities/movement.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Inventory, Movement])],
    controllers: [ReceivingController],
    providers: [ReceivingService],
})
export class ReceivingModule {}
