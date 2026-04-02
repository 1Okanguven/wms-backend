import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
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
    const { branchId, code, ...rest } = createWarehouseDto;
    
    let warehouseCode = code;
    if (!warehouseCode) {
      warehouseCode = createWarehouseDto.name.substring(0, 3).toUpperCase();
    }

    const existing = await this.warehouseRepository.findOneBy({ code: warehouseCode });
    if (existing) {
      throw new ConflictException(`'${warehouseCode}' kodlu depo zaten mevcut. Lütfen farklı bir kod giriniz.`);
    }

    const newWarehouse = this.warehouseRepository.create({
      ...rest,
      code: warehouseCode,
      branch: { id: branchId }
    });

    return await this.warehouseRepository.save(newWarehouse);
  }

  findAll() {
    return this.warehouseRepository.find({
      relations: ['branch', 'branch.company'],
    });
  }

  async findShippable() {
    return await this.warehouseRepository
      .createQueryBuilder('warehouse')
      .innerJoin('warehouse.zones', 'zone')
      .innerJoin('zone.aisles', 'aisle')
      .innerJoin('aisle.racks', 'rack')
      .leftJoinAndSelect('warehouse.branch', 'branch')
      .leftJoinAndSelect('branch.company', 'company')
      .select(['warehouse', 'branch', 'company'])
      .groupBy('warehouse.id, branch.id, company.id')
      .getMany();
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

    if (updateData.name && !updateData.code) {
      const existingName = await this.warehouseRepository.findOneBy({
        name: updateData.name,
        id: Not(id)
      });
      if (existingName) {
        throw new ConflictException(`'${updateData.name}' isimli depo zaten mevcut.`);
      }
    }

    if (updateData.code) {
      const existingCode = await this.warehouseRepository.findOneBy({
        code: updateData.code,
        id: Not(id)
      });
      if (existingCode) {
        throw new ConflictException(`'${updateData.code}' kodlu depo zaten mevcut.`);
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