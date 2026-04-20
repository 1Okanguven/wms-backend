import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { CreateMovementDto } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';
import { Movement, MovementType } from './entities/movement.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

@Injectable()
export class MovementService {
  constructor(
    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly dataSource: DataSource,
  ) { }

  async create(createMovementDto: CreateMovementDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (createMovementDto.type === MovementType.IN) {
        if (!createMovementDto.destinationRackId) throw new BadRequestException('IN işlemi için hedef raf zorunludur.');
        await this.increaseStock(queryRunner.manager, createMovementDto.productId, createMovementDto.destinationRackId, createMovementDto.quantity);
      }

      if (createMovementDto.type === MovementType.OUT || createMovementDto.type === MovementType.SHIPMENT || createMovementDto.type === MovementType.WASTE) {
        if (!createMovementDto.sourceRackId) throw new BadRequestException(`${createMovementDto.type} işlemi için kaynak raf zorunludur.`);
        await this.decreaseStock(queryRunner.manager, createMovementDto.productId, createMovementDto.sourceRackId, createMovementDto.quantity);
      }

      if (createMovementDto.type === MovementType.TRANSFER) {
        if (!createMovementDto.sourceRackId || !createMovementDto.destinationRackId) {
          throw new BadRequestException('TRANSFER işlemi için hem kaynak hem hedef raf zorunludur.');
        }
        await this.decreaseStock(queryRunner.manager, createMovementDto.productId, createMovementDto.sourceRackId, createMovementDto.quantity);
        await this.increaseStock(queryRunner.manager, createMovementDto.productId, createMovementDto.destinationRackId, createMovementDto.quantity);
      }

      let finalType = createMovementDto.type;
      if ((finalType === MovementType.OUT || finalType === MovementType.SHIPMENT) && (createMovementDto as any).targetWarehouseId) {
          finalType = MovementType.TRANSFER;
      }

      const newMovement = queryRunner.manager.create(Movement, {
        type: finalType,
        quantity: createMovementDto.quantity,
        referenceNumber: createMovementDto.referenceNumber,
        product: { id: createMovementDto.productId },
        sourceRack: createMovementDto.sourceRackId ? { id: createMovementDto.sourceRackId } : undefined,
        destinationRack: createMovementDto.destinationRackId ? { id: createMovementDto.destinationRackId } : undefined,
        user: { id: userId },
        targetWarehouse: (createMovementDto as any).targetWarehouseId ? { id: (createMovementDto as any).targetWarehouseId } : undefined,
      });

      const savedMovement = await queryRunner.manager.save(newMovement);

      await queryRunner.commitTransaction();
      return savedMovement;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async increaseStock(manager: EntityManager, productId: string, rackId: string, quantity: number) {
    let inventory = await manager.findOne(Inventory, {
      where: { product: { id: productId }, rack: { id: rackId } }
    });

    if (inventory) {
      inventory.quantity += quantity;
    } else {
      inventory = manager.create(Inventory, {
        quantity: quantity,
        product: { id: productId },
        rack: { id: rackId }
      });
    }
    await manager.save(inventory);
  }

  private async decreaseStock(manager: EntityManager, productId: string, rackId: string, quantity: number) {
    const inventory = await manager.findOne(Inventory, {
      where: { product: { id: productId }, rack: { id: rackId } }
    });

    if (!inventory || inventory.quantity < quantity) {
      throw new BadRequestException('Bu rafta yeterli stok bulunmuyor!');
    }

    inventory.quantity -= quantity;
    await manager.save(inventory);
  }

  async findAll(user: any) {
    const isWorker = user.role === 'WORKER';
    const warehouseId = user.warehouseId;

    const query = this.movementRepository.createQueryBuilder('movement')
      .leftJoin('movement.product', 'product')
      .leftJoin('movement.sourceRack', 'sRack')
      .leftJoin('movement.destinationRack', 'dRack')
      .select([
        'movement.id',
        'movement.type',
        'movement.quantity',
        'movement.referenceNumber',
        'movement.createdAt',
        'movement.shipmentType',
        'movement.customerName',
        'movement.destination',
        'movement.deliveryAddress',
        'movement.trackingNumber',
        'movement.shippingCompany',
        'product.id',
        'product.name',
        'product.sku',
        'sRack.id',
        'sRack.name',
        'sRack.code',
        'dRack.id',
        'dRack.name',
        'dRack.code'
      ])
      .orderBy('movement.createdAt', 'DESC');

    if (isWorker && warehouseId) {
      query.leftJoin('sRack.aisle', 'sAisle')
           .leftJoin('sAisle.zone', 'sZone')
           .leftJoin('dRack.aisle', 'dAisle')
           .leftJoin('dAisle.zone', 'dZone')
           .where('(sZone.warehouseId = :warehouseId OR dZone.warehouseId = :warehouseId)', { warehouseId });
    }

    return await query.getMany();
  }

  async findOne(id: string) {
    const movement = await this.movementRepository.findOne({
      where: { id },
      relations: ['product', 'sourceRack', 'destinationRack']
    });
    if (!movement) {
      throw new NotFoundException(`ID'si ${id} olan hareket bulunamadı.`);
    }
    return movement;
  }

  async update(id: string, updateMovementDto: UpdateMovementDto) {
    const updateData: any = { ...updateMovementDto };

    for (const key of Object.keys(updateData)) {
      if (key !== 'id' && key.endsWith('Id')) {
        const relationName = key.slice(0, -2);
        updateData[relationName] = { id: updateData[key] };
        delete updateData[key];
      }
    }

    const movement = await this.movementRepository.preload({
      id,
      ...updateData,
    });

    if (!movement) {
      throw new NotFoundException(`ID'si ${id} olan hareket güncellenemedi, bulunamadı.`);
    }

    return await this.movementRepository.save(movement);
  }

  async remove(id: string) {
    const movement = await this.findOne(id);
    return await this.movementRepository.remove(movement);
  }
}