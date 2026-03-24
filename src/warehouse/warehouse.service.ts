import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Warehouse } from './entities/warehouse.entity';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) { }

  async create(createWarehouseDto: CreateWarehouseDto) {
    const { branchId, ...rest } = createWarehouseDto;
    const newWarehouse = this.warehouseRepository.create({
      ...rest,
      branch: { id: branchId }
    });

    return await this.warehouseRepository.save(newWarehouse);
  }

  findAll() {
    return this.warehouseRepository.find({
      relations: ['branch', 'branch.company'],
    });
  }

  async findOne(id: string) {
    const warehouse = await this.warehouseRepository.findOneBy({ id });
    if (!warehouse) {
      throw new NotFoundException(`ID'si ${id} olan depo bulunamadı.`);
    }
    return warehouse;
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    const updateData: any = { ...updateWarehouseDto };

    for (const key of Object.keys(updateData)) {
      if (key !== 'id' && key.endsWith('Id')) {
        const relationName = key.slice(0, -2);
        updateData[relationName] = { id: updateData[key] };
        delete updateData[key];
      }
    }

    const warehouse = await this.warehouseRepository.preload({
      id,
      ...updateData,
    });

    if (!warehouse) {
      throw new NotFoundException(`ID'si ${id} olan depo güncellenemedi, bulunamadı.`);
    }

    return await this.warehouseRepository.save(warehouse);
  }

  async remove(id: string) {
    const warehouse = await this.findOne(id);
    return await this.warehouseRepository.remove(warehouse);
  }
}