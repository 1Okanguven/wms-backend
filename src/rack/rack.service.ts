import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';
import { Rack } from './entities/rack.entity';

@Injectable()
export class RackService {
  constructor(
    @InjectRepository(Rack)
    private readonly rackRepository: Repository<Rack>,
  ) { }

  async create(createRackDto: CreateRackDto) {
    const newRack = this.rackRepository.create({
      name: createRackDto.name,
      barcode: createRackDto.barcode,
      aisle: { id: createRackDto.aisleId }
    });

    return await this.rackRepository.save(newRack);
  }

  findAll() {
    return this.rackRepository.find();
  }

  async findOne(id: string) {
    const rack = await this.rackRepository.findOneBy({ id });
    if (!rack) {
      throw new NotFoundException(`ID'si ${id} olan raf bulunamadı.`);
    }
    return rack;
  }

  async update(id: string, updateRackDto: UpdateRackDto) {
    const updateData: any = { ...updateRackDto };

    for (const key of Object.keys(updateData)) {
      if (key !== 'id' && key.endsWith('Id')) {
        const relationName = key.slice(0, -2);
        updateData[relationName] = { id: updateData[key] };
        delete updateData[key];
      }
    }

    const rack = await this.rackRepository.preload({
      id,
      ...updateData,
    });

    if (!rack) {
      throw new NotFoundException(`ID'si ${id} olan raf güncellenemedi, bulunamadı.`);
    }

    return await this.rackRepository.save(rack);
  }

  async remove(id: string) {
    const rack = await this.findOne(id);
    return await this.rackRepository.remove(rack);
  }
}