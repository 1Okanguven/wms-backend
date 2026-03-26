import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Inventory } from './entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) { }

  async create(createInventoryDto: CreateInventoryDto) {
    const newInventory = this.inventoryRepository.create({
      quantity: createInventoryDto.quantity,
      product: { id: createInventoryDto.productId },
      rack: { id: createInventoryDto.rackId },
      lotNumber: createInventoryDto.lotNumber,
      productionDate: createInventoryDto.productionDate,
      expirationDate: createInventoryDto.expirationDate
    });

    return await this.inventoryRepository.save(newInventory);
  }

  findAll() {
    return this.inventoryRepository.find({
      relations: ['product', 'rack']
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
}