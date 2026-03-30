import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transfer, TransferStatus } from './entities/transfer.entity';

@Injectable()
export class TransferService {
    constructor(
        @InjectRepository(Transfer)
        private readonly transferRepository: Repository<Transfer>,
    ) {}

    async findPendingByWarehouse(targetWarehouseId: string) {
        const where: any = { status: TransferStatus.PENDING };
        if (targetWarehouseId !== 'all') {
            where.targetWarehouse = { id: targetWarehouseId };
        }
        
        return await this.transferRepository.find({
            where,
            relations: ['product', 'sourceWarehouse', 'targetWarehouse'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string) {
        const transfer = await this.transferRepository.findOne({
            where: { id },
            relations: ['product', 'sourceWarehouse', 'targetWarehouse'],
        });
        if (!transfer) {
            throw new NotFoundException(`ID'si ${id} olan transfer bulunamadı.`);
        }
        return transfer;
    }
}
