import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Inventory } from './entities/inventory.entity';
import { Movement, MovementType } from '../movement/entities/movement.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,
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

  findAll() {
    return this.inventoryRepository.find({
      relations: [
        'product', 
        'rack', 
        'rack.aisle', 
        'rack.aisle.zone', 
        'rack.aisle.zone.warehouse', 
        'rack.aisle.zone.warehouse.branch'
      ]
    });
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