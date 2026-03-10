import { Injectable } from '@nestjs/common';
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
    const newWarehouse = this.warehouseRepository.create({
      name: createWarehouseDto.name,
      type: createWarehouseDto.type,
      branch: { id: createWarehouseDto.branchId }
    });

    return await this.warehouseRepository.save(newWarehouse);
  }

  findAll() {
    return this.warehouseRepository.find();
  }

  findOne(id: string) {
    return this.warehouseRepository.findOneBy({ id });
  }

  update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    return `This action updates a #${id} warehouse`;
  }

  remove(id: string) {
    return `This action removes a #${id} warehouse`;
  }
}