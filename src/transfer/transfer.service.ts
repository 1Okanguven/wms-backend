import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Transfer, TransferStatus } from './entities/transfer.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Movement, MovementType } from '../movement/entities/movement.entity';

@Injectable()
export class TransferService {
    constructor(
        @InjectRepository(Transfer)
        private readonly transferRepository: Repository<Transfer>,
        private readonly dataSource: DataSource,
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
            relations: ['product', 'sourceWarehouse', 'targetWarehouse', 'sourceRack'],
        });
        if (!transfer) {
            throw new NotFoundException(`ID'si ${id} olan transfer bulunamadı.`);
        }
        return transfer;
    }

    async cancel(id: string, userId: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const transfer = await queryRunner.manager.findOne(Transfer, {
                where: { id },
                relations: ['product', 'sourceWarehouse', 'sourceRack'],
            });

            if (!transfer) {
                throw new NotFoundException(`Transfer kaydı bulunamadı.`);
            }

            if (transfer.status !== TransferStatus.PENDING) {
                throw new BadRequestException(`Sadece BEKLEYEN (PENDING) durumundaki transferler iptal edilebilir.`);
            }

            if (!transfer.sourceRack) {
                throw new BadRequestException(`Transferin kaynak raf bilgisi eksik, otomatik iade yapılamaz.`);
            }


            let inventory = await queryRunner.manager.findOne(Inventory, {
                where: {
                    product: { id: transfer.product.id },
                    rack: { id: transfer.sourceRack.id },
                    lotNumber: transfer.lotNumber || IsNull(),
                },
            });

            if (inventory) {
                inventory.quantity += transfer.quantity;
                await queryRunner.manager.save(Inventory, inventory);
            } else {
                inventory = queryRunner.manager.create(Inventory, {
                    product: transfer.product,
                    rack: transfer.sourceRack,
                    quantity: transfer.quantity,
                    lotNumber: transfer.lotNumber,
                    productionDate: transfer.productionDate,
                    expirationDate: transfer.expirationDate,
                });
                await queryRunner.manager.save(Inventory, inventory);
            }


            await queryRunner.manager.update(Transfer, transfer.id, { 
                status: TransferStatus.CANCELLED 
            });


            const movementData = {
                type: MovementType.RETURN,
                quantity: transfer.quantity,
                product: { id: transfer.product.id } as any,
                sourceRack: { id: transfer.sourceRack.id } as any,
                user: { id: userId } as any,
                destination: `İptal: ${transfer.sourceWarehouse.name} deposuna iade edildi.`,
                referenceNumber: transfer.referenceNumber,
            };
            

            await queryRunner.manager.insert(Movement, movementData);

            await queryRunner.commitTransaction();
            return {
                success: true,
                message: 'İç transfer başarıyla iptal edildi ve stoklar iade edildi.',
                transferId: transfer.id
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
