import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { CreateReceivingDto } from './dto/create-receiving.dto';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Movement, MovementType } from '../movement/entities/movement.entity';

@Injectable()
export class ReceivingService {
    constructor(
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
        @InjectRepository(Movement)
        private readonly movementRepository: Repository<Movement>,
        private readonly dataSource: DataSource,
    ) {}

    async receive(dto: CreateReceivingDto, userId: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // --- ADIM 1: Inventory güncelle ya da oluştur ---
            const existingInventory = await queryRunner.manager.findOne(Inventory, {
                where: {
                    product: { id: dto.productId },
                    rack: { id: dto.rackId },
                    lotNumber: dto.lotNumber ?? IsNull(),
                },
            });

            if (existingInventory) {
                existingInventory.quantity += dto.quantity;
                await queryRunner.manager.save(Inventory, existingInventory);
            } else {
                const newInventory = new Inventory();
                newInventory.quantity = dto.quantity;
                newInventory.product = { id: dto.productId } as any;
                newInventory.rack = { id: dto.rackId } as any;
                newInventory.lotNumber = (dto.lotNumber ?? null) as any;
                newInventory.productionDate = (dto.productionDate ? new Date(dto.productionDate) : null) as any;
                newInventory.expirationDate = (dto.expirationDate ? new Date(dto.expirationDate) : null) as any;
                await queryRunner.manager.save(Inventory, newInventory);
            }

            // --- ADIM 2: Movement (Stok Hareketi) logu oluştur ---
            const movement = new Movement();
            movement.type = MovementType.IN;
            movement.quantity = dto.quantity;
            movement.product = { id: dto.productId } as any;
            movement.destinationRack = { id: dto.rackId } as any;
            movement.user = { id: userId } as any;
            await queryRunner.manager.save(Movement, movement);

            // --- ADIM 3: Eğer bir Transfer üzerinden geliyorsa statüsünü güncelle ---
            if (dto.transferId) {
                await queryRunner.manager.update('Transfer', 
                    { id: dto.transferId }, 
                    { status: 'COMPLETED' }
                );
            }

            // --- ADIM 4: Commit ---
            await queryRunner.commitTransaction();

            return {
                message: 'Mal kabul işlemi başarıyla tamamlandı.',
                quantity: dto.quantity,
                productId: dto.productId,
                rackId: dto.rackId,
                transferId: dto.transferId || null,
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException(
                error?.message || 'Mal kabul işlemi sırasında bir hata oluştu.',
            );
        } finally {
            await queryRunner.release();
        }
    }
}
