import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAisleDto } from './dto/create-aisle.dto';
import { UpdateAisleDto } from './dto/update-aisle.dto';
import { Aisle } from './entities/aisle.entity';

@Injectable()
export class AisleService {
  constructor(
    @InjectRepository(Aisle)
    private readonly aisleRepository: Repository<Aisle>,
  ) { }

  async create(createAisleDto: CreateAisleDto) {
    const newAisle = this.aisleRepository.create({
      name: createAisleDto.name,
      zone: { id: createAisleDto.zoneId }
    });

    return await this.aisleRepository.save(newAisle);
  }

  findAll() {
    return this.aisleRepository.find({
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
    const updateData: any = { ...updateAisleDto };

    for (const key of Object.keys(updateData)) {
      if (key !== 'id' && key.endsWith('Id')) {
        const relationName = key.slice(0, -2);
        updateData[relationName] = { id: updateData[key] };
        delete updateData[key];
      }
    }

    const aisle = await this.aisleRepository.preload({
      id,
      ...updateData,
    });

    if (!aisle) {
      throw new NotFoundException(`ID'si ${id} olan koridor/aisle güncellenemedi, bulunamadı.`);
    }

    return await this.aisleRepository.save(aisle);
  }

  async remove(id: string) {
    const aisle = await this.findOne(id);
    return await this.aisleRepository.remove(aisle);
  }
}