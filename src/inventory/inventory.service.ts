import { Injectable } from '@nestjs/common';
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
      rack: { id: createInventoryDto.rackId }
    });

    return await this.inventoryRepository.save(newInventory);
  }

  findAll() {
    return this.inventoryRepository.find({
      relations: ['product', 'rack'] // İlişkili verileri de getirmesi için eklendi
    });
  }

  findOne(id: string) {
    return this.inventoryRepository.findOne({
      where: { id },
      relations: ['product', 'rack']
    });
  }

  update(id: string, updateInventoryDto: UpdateInventoryDto) {
    return `This action updates a #${id} inventory`;
  }

  remove(id: string) {
    return `This action removes a #${id} inventory`;
  }
}