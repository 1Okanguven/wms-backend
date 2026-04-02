import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZoneService } from './zone.service';
import { ZoneController } from './zone.controller';
import { Zone } from './entities/zone.entity';
import { Warehouse } from '../warehouse/entities/warehouse.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Zone, Warehouse])],
  controllers: [ZoneController],
  providers: [ZoneService],
})
export class ZoneModule { }