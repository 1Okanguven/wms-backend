import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CreateAisleDto } from './dto/create-aisle.dto';
import { UpdateAisleDto } from './dto/update-aisle.dto';
import { Aisle } from './entities/aisle.entity';

import { Zone } from '../zone/entities/zone.entity';

@Injectable()
export class AisleService {
  constructor(
    @InjectRepository(Aisle)
    private readonly aisleRepository: Repository<Aisle>,
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
  ) { }

  async create(createAisleDto: CreateAisleDto) {
    const zone = await this.zoneRepository.findOneBy({ id: createAisleDto.zoneId });
    if (!zone) {
      throw new NotFoundException(`Bölge (Zone) bulunamadı.`);
    }

    const { name, code, zoneId } = createAisleDto;

    const existing = await this.aisleRepository.findOneBy({
      code: code.toUpperCase(),
      zone: { id: zoneId }
    });
    if (existing) {
      throw new ConflictException(`Bu bölgede '${code}' kodlu koridor zaten mevcut.`);
    }

    const locationCode = `${zone.locationCode}-${code.toUpperCase()}`;

    const newAisle = this.aisleRepository.create({
      name,
      code: code.toUpperCase(),
      locationCode,
      zone: { id: zoneId }
    });

    return await this.aisleRepository.save(newAisle);
  }

  findAll(user: any) {
    const isWorker = user.role === 'WORKER';
    const where: any = {};
    
    if (isWorker && user.warehouseId) {
      where.zone = { warehouse: { id: user.warehouseId } };
    }

    return this.aisleRepository.find({
      where,
      relations: ['zone', 'zone.warehouse'],
    });
  }

  async findOne(id: string) {
    const aisle = await this.aisleRepository.findOne({
      where: { id },
      relations: ['zone', 'zone.warehouse'],
    });
    if (!aisle) {
      throw new NotFoundException(`ID'si ${id} olan koridor/aisle bulunamadı.`);
    }
    return aisle;
  }

  async update(id: string, updateAisleDto: UpdateAisleDto) {
    const aisle = await this.findOne(id);
    const { name, code, zoneId } = updateAisleDto;

    const targetCode = code ? code.toUpperCase() : aisle.code;
    const targetZoneId = zoneId || aisle.zone?.id;

    if (code || zoneId) {
      const existing = await this.aisleRepository.findOne({
        where: {
          code: targetCode,
          zone: { id: targetZoneId },
          id: Not(id)
        }
      });
      if (existing) {
        throw new ConflictException(`Bu bölgede '${targetCode}' kodlu koridor zaten mevcut.`);
      }
    }

    const zone = zoneId
      ? await this.zoneRepository.findOneBy({ id: zoneId })
      : aisle.zone;

    if (!zone) {
      throw new NotFoundException(`Bölge (Zone) bulunamadı.`);
    }

    const updatedName = name || aisle.name;
    const updatedCode = targetCode;
    const updatedLocationCode = `${zone.locationCode}-${updatedCode}`;

    Object.assign(aisle, {
      ...updateAisleDto,
      name: updatedName,
      code: updatedCode,
      locationCode: updatedLocationCode,
      zone
    });

    return await this.aisleRepository.save(aisle);
  }

  async remove(id: string) {
    const aisle = await this.findOne(id);
    return await this.aisleRepository.remove(aisle);
  }
}