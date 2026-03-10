import { Injectable } from '@nestjs/common';
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
    return this.zoneRepository.find();
  }

  findOne(id: string) {
    return this.zoneRepository.findOneBy({ id });
  }

  update(id: string, updateZoneDto: UpdateZoneDto) {
    return `This action updates a #${id} zone`;
  }

  remove(id: string) {
    return `This action removes a #${id} zone`;
  }
}