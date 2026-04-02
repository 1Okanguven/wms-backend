import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Movement, MovementType } from '../movement/entities/movement.entity';
import { Warehouse } from '../warehouse/entities/warehouse.entity';

@Injectable()
export class ShippingService {
    constructor(
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
        @InjectRepository(Movement)
        private readonly movementRepository: Repository<Movement>,
        private readonly dataSource: DataSource,
    ) { }

    async ship(dto: CreateShippingDto, userId: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            if (dto.shipmentType === 'INTERNAL' && dto.targetWarehouseId) {
                const targetWhWithRacks = await queryRunner.manager
                    .createQueryBuilder(Warehouse, 'warehouse')
                    .innerJoin('warehouse.zones', 'zone')
                    .innerJoin('zone.aisles', 'aisle')
                    .innerJoin('aisle.racks', 'rack')
                    .where('warehouse.id = :id', { id: dto.targetWarehouseId })
                    .getOne();

                if (!targetWhWithRacks) {
                    throw new BadRequestException(
                        'Hedef deponun fiziksel kurulumu (raf) yapılmamış. Rafı olmayan bir depoya sevkiyat gerçekleştirilemez.',
                    );
                }
            }


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


            inventory.quantity -= dto.quantity;

            if (inventory.quantity === 0) {

                await queryRunner.manager.remove(Inventory, inventory);
            } else {
                await queryRunner.manager.save(Inventory, inventory);
            }


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


            if (dto.shipmentType === 'INTERNAL' && dto.targetWarehouseId) {

                const inventoryWithRelations = await queryRunner.manager.findOne(Inventory, {
                    where: { id: inventory.id },
                    relations: ['rack', 'rack.aisle', 'rack.aisle.zone', 'rack.aisle.zone.warehouse'],
                });

                const sourceWarehouse = inventoryWithRelations?.rack?.aisle?.zone?.warehouse;

                if (sourceWarehouse) {
                    const transfer = {
                        product: { id: dto.productId },
                        quantity: dto.quantity,
                        sourceWarehouse: { id: sourceWarehouse.id },
                        sourceRack: { id: dto.rackId },
                        targetWarehouse: { id: dto.targetWarehouseId },
                        status: 'PENDING',
                        referenceNumber: dto.referenceNumber || null,
                        lotNumber: inventoryWithRelations.lotNumber || null,
                        productionDate: inventoryWithRelations.productionDate || null,
                        expirationDate: inventoryWithRelations.expirationDate || null,
                    };

                    console.log(`[ShippingService] Internal Transfer oluşturuluyor: Lot: ${transfer.lotNumber}, Prod: ${transfer.productionDate}, Exp: ${transfer.expirationDate}, SourceRack: ${dto.rackId}`);

                    await queryRunner.manager.save('Transfer', transfer);
                }
            }


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
