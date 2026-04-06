import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { Zone } from './entities/zone.entity';

import { Warehouse } from '../warehouse/entities/warehouse.entity';

@Injectable()
export class ZoneService {
  constructor(
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) { }

  async create(createZoneDto: CreateZoneDto) {
    const warehouse = await this.warehouseRepository.findOneBy({ id: createZoneDto.warehouseId });
    if (!warehouse) {
      throw new NotFoundException(`Depo bulunamadı.`);
    }

    const { name, code, type, warehouseId } = createZoneDto;


    const existing = await this.zoneRepository.findOneBy({
      code: code.toUpperCase(),
      warehouse: { id: warehouseId }
    });
    if (existing) {
      throw new ConflictException(`Bu depoda '${code}' kodlu bölge zaten mevcut.`);
    }

    const locationCode = `${warehouse.code}-${code.toUpperCase()}`;

    const newZone = this.zoneRepository.create({
      name,
      code: code.toUpperCase(),
      locationCode,
      type,
      warehouse: { id: warehouseId }
    });

    return await this.zoneRepository.save(newZone);
  }

  findAll(user: any) {
    const isWorker = user.role === 'WORKER';
    const where: any = {};
    
    if (isWorker && user.warehouseId) {
      where.warehouse = { id: user.warehouseId };
    }

    return this.zoneRepository.find({
      where,
      relations: ['warehouse'],
    });
  }

  async findOne(id: string) {
    const zone = await this.zoneRepository.findOne({
      where: { id },
      relations: ['warehouse'],
    });
    if (!zone) {
      throw new NotFoundException(`ID'si ${id} olan alan (zone) bulunamadı.`);
    }
    return zone;
  }

  async update(id: string, updateZoneDto: UpdateZoneDto) {
    const zone = await this.findOne(id);
    const { name, code, type, warehouseId } = updateZoneDto;


    const targetCode = code ? code.toUpperCase() : zone.code;
    const targetWarehouseId = warehouseId || zone.warehouse?.id;

    if (code || warehouseId) {
      const existing = await this.zoneRepository.findOne({
        where: {
          code: targetCode,
          warehouse: { id: targetWarehouseId },
          id: Not(id)
        }
      });
      if (existing) {
        throw new ConflictException(`Bu depoda '${targetCode}' kodlu bölge zaten mevcut.`);
      }
    }


    const warehouse = warehouseId 
      ? await this.warehouseRepository.findOne({ where: { id: warehouseId } })
      : zone.warehouse;

    if (!warehouse) {
      throw new NotFoundException(`Depo bulunamadı.`);
    }


    const updatedName = name || zone.name;
    const updatedCode = targetCode;
    const updatedLocationCode = `${warehouse.code}-${updatedCode}`;

    Object.assign(zone, {
      ...updateZoneDto,
      name: updatedName,
      code: updatedCode,
      locationCode: updatedLocationCode,
      warehouse
    });

    return await this.zoneRepository.save(zone);
  }

  async remove(id: string) {
    const zone = await this.findOne(id);
    return await this.zoneRepository.remove(zone);
  }
}