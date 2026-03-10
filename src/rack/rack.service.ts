import { Injectable } from '@nestjs/common';
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

  findOne(id: string) {
    return this.rackRepository.findOneBy({ id });
  }

  update(id: string, updateRackDto: UpdateRackDto) {
    return `This action updates a #${id} rack`;
  }

  remove(id: string) {
    return `This action removes a #${id} rack`;
  }
}