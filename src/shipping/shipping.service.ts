import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Movement, MovementType } from '../movement/entities/movement.entity';

@Injectable()
export class ShippingService {
    constructor(
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
        @InjectRepository(Movement)
        private readonly movementRepository: Repository<Movement>,
        private readonly dataSource: DataSource,
    ) {}

    async ship(dto: CreateShippingDto, userId: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // --- ADIM 1: Mevcut stok kaydını bul ---
            const inventory = await queryRunner.manager.findOne(Inventory, {
                where: {
                    product: { id: dto.productId },
                    rack: { id: dto.rackId },
                },
            });

            if (!inventory) {
                throw new BadRequestException(
                    'Belirtilen ürün ve rafta stok kaydı bulunamadı.',
                );
            }

            if (inventory.quantity < dto.quantity) {
                throw new BadRequestException(
                    `Yetersiz stok. Mevcut: ${inventory.quantity}, İstenen: ${dto.quantity}.`,
                );
            }

            // --- ADIM 2: Stok miktarını düş ---
            inventory.quantity -= dto.quantity;

            if (inventory.quantity === 0) {
                // Miktar sıfıra düşerse kaydı sil
                await queryRunner.manager.remove(Inventory, inventory);
            } else {
                await queryRunner.manager.save(Inventory, inventory);
            }

            // --- ADIM 3: Movement (Stok Hareketi) logu oluştur ---
            const movement = new Movement();
            movement.type = MovementType.SHIPMENT;
            movement.quantity = dto.quantity;
            movement.product = { id: dto.productId } as any;
            movement.sourceRack = { id: dto.rackId } as any;
            movement.user = { id: userId } as any;
            movement.destination = dto.destination ?? null;
            movement.shipmentType = dto.shipmentType;
            movement.customerName = dto.customerName ?? null;
            movement.deliveryAddress = dto.deliveryAddress ?? null;
            movement.shippingCompany = dto.shippingCompany ?? null;
            movement.trackingNumber = dto.trackingNumber ?? null;
            movement.targetWarehouse = dto.targetWarehouseId ? { id: dto.targetWarehouseId } as any : null;
            movement.referenceNumber = dto.referenceNumber ?? null;
            await queryRunner.manager.save(Movement, movement);

            // --- ADIM 4: Commit ---
            await queryRunner.commitTransaction();

            return {
                message: 'Sevkiyat işlemi başarıyla tamamlandı.',
                quantity: dto.quantity,
                productId: dto.productId,
                rackId: dto.rackId,
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException(
                error?.message || 'Sevkiyat işlemi sırasında bir hata oluştu.',
            );
        } finally {
            await queryRunner.release();
        }
    }
}
