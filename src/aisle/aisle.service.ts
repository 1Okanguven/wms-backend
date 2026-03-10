import { Injectable } from '@nestjs/common';
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
    return this.aisleRepository.find();
  }

  findOne(id: string) {
    return this.aisleRepository.findOneBy({ id });
  }

  update(id: string, updateAisleDto: UpdateAisleDto) {
    return `This action updates a #${id} aisle`;
  }

  remove(id: string) {
    return `This action removes a #${id} aisle`;
  }
}