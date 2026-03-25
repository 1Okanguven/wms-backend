import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { Zone } from './entities/zone.entity';

@Injectable()
export class ZoneService {
  constructor(
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
  ) { }

  async create(createZoneDto: CreateZoneDto) {
    const newZone = this.zoneRepository.create({
      name: createZoneDto.name,
      type: createZoneDto.type,
      warehouse: { id: createZoneDto.warehouseId }
    });

    return await this.zoneRepository.save(newZone);
  }

  findAll() {
    return this.zoneRepository.find({
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
    const updateData: any = { ...updateZoneDto };

    for (const key of Object.keys(updateData)) {
      if (key !== 'id' && key.endsWith('Id')) {
        const relationName = key.slice(0, -2);
        updateData[relationName] = { id: updateData[key] };
        delete updateData[key];
      }
    }

    const zone = await this.zoneRepository.preload({
      id,
      ...updateData,
    });

    if (!zone) {
      throw new NotFoundException(`ID'si ${id} olan alan (zone) güncellenemedi, bulunamadı.`);
    }

    return await this.zoneRepository.save(zone);
  }

  async remove(id: string) {
    const zone = await this.findOne(id);
    return await this.zoneRepository.remove(zone);
  }
}