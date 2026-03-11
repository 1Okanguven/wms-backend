import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovementDto } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';
import { Movement, MovementType } from './entities/movement.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

@Injectable()
export class MovementService {
  constructor(
    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) { }

  async create(createMovementDto: CreateMovementDto) {

    if (createMovementDto.type === MovementType.IN) {
      if (!createMovementDto.destinationRackId) throw new BadRequestException('IN işlemi için hedef raf zorunludur.');
      await this.increaseStock(createMovementDto.productId, createMovementDto.destinationRackId, createMovementDto.quantity);
    }

    if (createMovementDto.type === MovementType.OUT) {
      if (!createMovementDto.sourceRackId) throw new BadRequestException('OUT işlemi için kaynak raf zorunludur.');
      await this.decreaseStock(createMovementDto.productId, createMovementDto.sourceRackId, createMovementDto.quantity);
    }

    if (createMovementDto.type === MovementType.TRANSFER) {
      if (!createMovementDto.sourceRackId || !createMovementDto.destinationRackId) {
        throw new BadRequestException('TRANSFER işlemi için hem kaynak hem hedef raf zorunludur.');
      }
      await this.decreaseStock(createMovementDto.productId, createMovementDto.sourceRackId, createMovementDto.quantity);
      await this.increaseStock(createMovementDto.productId, createMovementDto.destinationRackId, createMovementDto.quantity);
    }

    const newMovement = this.movementRepository.create({
      type: createMovementDto.type,
      quantity: createMovementDto.quantity,
      product: { id: createMovementDto.productId },
      sourceRack: createMovementDto.sourceRackId ? { id: createMovementDto.sourceRackId } : undefined,
      destinationRack: createMovementDto.destinationRackId ? { id: createMovementDto.destinationRackId } : undefined,
    });

    return await this.movementRepository.save(newMovement);
  }

  private async increaseStock(productId: string, rackId: string, quantity: number) {
    let inventory = await this.inventoryRepository.findOne({
      where: { product: { id: productId }, rack: { id: rackId } }
    });

    if (inventory) {
      inventory.quantity += quantity;
    } else {
      inventory = this.inventoryRepository.create({
        quantity: quantity,
        product: { id: productId },
        rack: { id: rackId }
      });
    }
    await this.inventoryRepository.save(inventory);
  }

  private async decreaseStock(productId: string, rackId: string, quantity: number) {
    const inventory = await this.inventoryRepository.findOne({
      where: { product: { id: productId }, rack: { id: rackId } }
    });

    if (!inventory || inventory.quantity < quantity) {
      throw new BadRequestException('Bu rafta yeterli stok bulunmuyor!');
    }

    inventory.quantity -= quantity;
    await this.inventoryRepository.save(inventory);
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