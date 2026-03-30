import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from './entities/transfer.entity';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Transfer])],
    controllers: [TransferController],
    providers: [TransferService],
    exports: [TransferService],
})
export class TransferModule {}
