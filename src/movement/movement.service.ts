import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovementDto } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';
import { Movement } from './entities/movement.entity';

@Injectable()
export class MovementService {
  constructor(
    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,
  ) { }

  async create(createMovementDto: CreateMovementDto) {
    const newMovement = this.movementRepository.create({
      type: createMovementDto.type,
      quantity: createMovementDto.quantity,
      product: { id: createMovementDto.productId },
      // Eğer kaynak veya hedef raf ID'si gelmişse ilişkiyi kur, gelmemişse undefined bırak
      sourceRack: createMovementDto.sourceRackId ? { id: createMovementDto.sourceRackId } : undefined,
      destinationRack: createMovementDto.destinationRackId ? { id: createMovementDto.destinationRackId } : undefined,
    });

    return await this.movementRepository.save(newMovement);
  }

  findAll() {
    return this.movementRepository.find({
      relations: ['product', 'sourceRack', 'destinationRack'],
      order: { createdAt: 'DESC' }
    });
  }

  findOne(id: string) {
    return this.movementRepository.findOne({
      where: { id },
      relations: ['product', 'sourceRack', 'destinationRack']
    });
  }

  update(id: string, updateMovementDto: UpdateMovementDto) {
    return `This action updates a #${id} movement`;
  }

  remove(id: string) {
    return `This action removes a #${id} movement`;
  }
}