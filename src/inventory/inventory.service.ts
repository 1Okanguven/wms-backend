import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Inventory } from './entities/inventory.entity';
import { Movement, MovementType } from '../movement/entities/movement.entity';
import { NotificationGateway } from '../notifications/notification.gateway';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,
    private readonly notificationGateway: NotificationGateway,
  ) { }

  async create(createInventoryDto: CreateInventoryDto, userId: string) {
    const newInventory = this.inventoryRepository.create({
      quantity: createInventoryDto.quantity,
      product: { id: createInventoryDto.productId },
      rack: { id: createInventoryDto.rackId },
      lotNumber: createInventoryDto.lotNumber,
      productionDate: createInventoryDto.productionDate,
      expirationDate: createInventoryDto.expirationDate
    });

    const savedInventory = await this.inventoryRepository.save(newInventory);

    // Gerçek zamanlı bildirim gönder
    this.notificationGateway.sendSystemAlert({
      type: 'STOCK_ADDED',
      title: 'Yeni Stok Eklendi',
      message: `${createInventoryDto.quantity} adet ürün başarıyla sisteme eklendi.`,
      timestamp: new Date()
    });

    const movement = this.movementRepository.create({
      type: MovementType.IN,
      quantity: createInventoryDto.quantity,
      referenceNumber: 'Manuel Ekleme / Sayım Fazlası',
      product: { id: createInventoryDto.productId },
      destinationRack: { id: createInventoryDto.rackId },
      user: { id: userId }
    });
    await this.movementRepository.save(movement);

    return savedInventory;
  }

  async findAll(user: any) {
    const isWorker = user.role === 'WORKER';
    const warehouseId = user.warehouseId;

    const query = this.inventoryRepository.createQueryBuilder('inventory')
      .leftJoin('inventory.product', 'product')
      .leftJoin('inventory.rack', 'rack')
      .leftJoin('rack.aisle', 'aisle')
      .leftJoin('aisle.zone', 'zone')
      .leftJoin('zone.warehouse', 'warehouse')
      .leftJoin('warehouse.branch', 'branch')
      .select([
        'inventory.id',
        'inventory.quantity',
        'inventory.lotNumber',
        'inventory.productionDate',
        'inventory.expirationDate',
        'product.id',
        'product.name',
        'product.sku',
        'product.unit',
        'rack.id',
        'rack.code',
        'rack.locationCode',
        'aisle.id',
        'zone.id',
        'warehouse.id',
        'warehouse.name',
        'branch.name'
      ]);

    if (isWorker && warehouseId) {
      query.where('warehouse.id = :warehouseId', { warehouseId });
    }

    return await query.getMany();
  }

  async findOne(id: string) {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['product', 'rack']
    });
    if (!inventory) {
      throw new NotFoundException(`ID'si ${id} olan envanter kaydı bulunamadı.`);
    }
    return inventory;
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto) {
    const updateData: any = { ...updateInventoryDto };

    for (const key of Object.keys(updateData)) {
      if (key !== 'id' && key.endsWith('Id')) {
        const relationName = key.slice(0, -2);
        updateData[relationName] = { id: updateData[key] };
        delete updateData[key];
      }
    }

    const inventory = await this.inventoryRepository.preload({
      id,
      ...updateData,
    });

    if (!inventory) {
      throw new NotFoundException(`ID'si ${id} olan envanter güncellenemedi, bulunamadı.`);
    }

    return await this.inventoryRepository.save(inventory);
  }

  async remove(id: string) {
    const inventory = await this.findOne(id);
    return await this.inventoryRepository.remove(inventory);
  }

  async findByWarehouse(warehouseId: string) {
    return await this.inventoryRepository.find({
      where: {
        rack: {
          aisle: {
            zone: {
              warehouse: { id: warehouseId }
            }
          }
        }
      },
      relations: ['product', 'rack', 'rack.aisle', 'rack.aisle.zone', 'rack.aisle.zone.warehouse']
    });
  }
}