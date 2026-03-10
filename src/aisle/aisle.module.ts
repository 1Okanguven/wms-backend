import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AisleService } from './aisle.service';
import { AisleController } from './aisle.controller';
import { Aisle } from './entities/aisle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Aisle])],
  controllers: [AisleController],
  providers: [AisleService],
})
export class AisleModule { }