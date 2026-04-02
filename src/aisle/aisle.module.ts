import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AisleService } from './aisle.service';
import { AisleController } from './aisle.controller';
import { Aisle } from './entities/aisle.entity';
import { Zone } from '../zone/entities/zone.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Aisle, Zone])],
  controllers: [AisleController],
  providers: [AisleService],
})
export class AisleModule { }