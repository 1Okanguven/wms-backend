import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RackService } from './rack.service';
import { RackController } from './rack.controller';
import { Rack } from './entities/rack.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rack])],
  controllers: [RackController],
  providers: [RackService],
})
export class RackModule { }