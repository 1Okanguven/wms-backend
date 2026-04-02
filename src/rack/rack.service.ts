import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';
import { Rack } from './entities/rack.entity';

import { Aisle } from '../aisle/entities/aisle.entity';

@Injectable()
export class RackService {
  constructor(
    @InjectRepository(Rack)
    private readonly rackRepository: Repository<Rack>,
    @InjectRepository(Aisle)
    private readonly aisleRepository: Repository<Aisle>,
  ) { }

  async create(createRackDto: CreateRackDto) {
    const aisle = await this.aisleRepository.findOneBy({ id: createRackDto.aisleId });
    if (!aisle) {
      throw new NotFoundException(`Koridor (Aisle) bulunamadı.`);
    }

    const { name, code, barcode, aisleId } = createRackDto;


    const existing = await this.rackRepository.findOneBy({
      code: code.toUpperCase(),
      aisle: { id: aisleId }
    });
    if (existing) {
      throw new ConflictException(`Bu koridorda '${code}' kodlu raf zaten mevcut.`);
    }

    const locationCode = `${aisle.locationCode}-${code.toUpperCase()}`;

    const newRack = this.rackRepository.create({
      name,
      code: code.toUpperCase(),
      locationCode,
      barcode,
      aisle: { id: aisleId }
    });

    return await this.rackRepository.save(newRack);
  }

  findAll() {
    return this.rackRepository.find({
      relations: ['aisle', 'aisle.zone', 'aisle.zone.warehouse'],
    });
  }

  async findOne(id: string) {
    const rack = await this.rackRepository.findOne({
      where: { id },
      relations: ['aisle', 'aisle.zone', 'aisle.zone.warehouse'],
    });
    if (!rack) {
      throw new NotFoundException(`ID'si ${id} olan raf bulunamadı.`);
    }
    return rack;
  }

  async update(id: string, updateRackDto: UpdateRackDto) {
    const rack = await this.findOne(id);
    const { name, code, barcode, aisleId } = updateRackDto;


    const targetCode = code ? code.toUpperCase() : rack.code;
    const targetAisleId = aisleId || rack.aisle?.id;

    if (code || aisleId) {
      const existing = await this.rackRepository.findOne({
        where: {
          code: targetCode,
          aisle: { id: targetAisleId },
          id: Not(id)
        }
      });
      if (existing) {
        throw new ConflictException(`Bu koridorda '${targetCode}' kodlu raf zaten mevcut.`);
      }
    }


    if (barcode && barcode !== rack.barcode) {
      const existingBarcode = await this.rackRepository.findOneBy({
        barcode: barcode,
        id: Not(id)
      });
      if (existingBarcode) {
        throw new ConflictException(`'${barcode}' barkodu başka bir rafa ait.`);
      }
    }


    const aisle = aisleId 
      ? await this.aisleRepository.findOneBy({ id: aisleId })
      : rack.aisle;

    if (!aisle) {
      throw new NotFoundException(`Koridor (Aisle) bulunamadı.`);
    }


    const updatedName = name || rack.name;
    const updatedCode = targetCode;
    const updatedLocationCode = `${aisle.locationCode}-${updatedCode}`;

    Object.assign(rack, {
      ...updateRackDto,
      name: updatedName,
      code: updatedCode,
      locationCode: updatedLocationCode,
      aisle
    });

    return await this.rackRepository.save(rack);
  }

  async remove(id: string) {
    const rack = await this.findOne(id);
    return await this.rackRepository.remove(rack);
  }
}