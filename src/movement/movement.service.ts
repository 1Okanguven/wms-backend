import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm'; // DataSource ve EntityManager eklendi
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
    private readonly dataSource: DataSource, // Transaction yönetimi için eklendi
  ) { }

  async create(createMovementDto: CreateMovementDto) {
    // 1. QueryRunner oluştur ve veritabanına bağlan
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    // 2. Transaction'ı (bölünemez işlemi) başlat
    await queryRunner.startTransaction();

    try {
      // BÜTÜN İŞLEMLERİ ARTIK queryRunner.manager ÜZERİNDEN YAPIYORUZ

      // IN (Mal Kabul)
      if (createMovementDto.type === MovementType.IN) {
        if (!createMovementDto.destinationRackId) throw new BadRequestException('IN işlemi için hedef raf zorunludur.');
        await this.increaseStock(queryRunner.manager, createMovementDto.productId, createMovementDto.destinationRackId, createMovementDto.quantity);
      }

      // OUT (Sevkiyat)
      if (createMovementDto.type === MovementType.OUT) {
        if (!createMovementDto.sourceRackId) throw new BadRequestException('OUT işlemi için kaynak raf zorunludur.');
        await this.decreaseStock(queryRunner.manager, createMovementDto.productId, createMovementDto.sourceRackId, createMovementDto.quantity);
      }

      // TRANSFER (Depo İçi Taşıma)
      if (createMovementDto.type === MovementType.TRANSFER) {
        if (!createMovementDto.sourceRackId || !createMovementDto.destinationRackId) {
          throw new BadRequestException('TRANSFER işlemi için hem kaynak hem hedef raf zorunludur.');
        }
        await this.decreaseStock(queryRunner.manager, createMovementDto.productId, createMovementDto.sourceRackId, createMovementDto.quantity);

        await this.increaseStock(queryRunner.manager, createMovementDto.productId, createMovementDto.destinationRackId, createMovementDto.quantity);
      }

      const newMovement = queryRunner.manager.create(Movement, {
        type: createMovementDto.type,
        quantity: createMovementDto.quantity,
        product: { id: createMovementDto.productId },
        sourceRack: createMovementDto.sourceRackId ? { id: createMovementDto.sourceRackId } : undefined,
        destinationRack: createMovementDto.destinationRackId ? { id: createMovementDto.destinationRackId } : undefined,
      });

      const savedMovement = await queryRunner.manager.save(newMovement);

      // 3. HER ŞEY BAŞARILIYSA KALICI HALE GETİR (COMMIT)
      await queryRunner.commitTransaction();
      return savedMovement;

    } catch (error) {
      // 4. HATA ÇIKARSA HER ŞEYİ ESKİ HALİNE GERİ SAR (ROLLBACK)
      await queryRunner.rollbackTransaction();
      throw error; // Hatayı kullanıcıya fırlat
    } finally {
      // 5. İşin bitince veritabanı bağlantısını serbest bırak
      await queryRunner.release();
    }
  }

  // YARDIMCI METOTLAR (Artık EntityManager alıyorlar ki aynı transaction içinde çalışsınlar)
  private async increaseStock(manager: EntityManager, productId: string, rackId: string, quantity: number) {
    let inventory = await manager.findOne(Inventory, {
      where: { product: { id: productId }, rack: { id: rackId } }
    });

    if (inventory) {
      inventory.quantity += quantity;
    } else {
      inventory = manager.create(Inventory, {
        quantity: quantity,
        product: { id: productId },
        rack: { id: rackId }
      });
    }
    await manager.save(inventory);
  }

  private async decreaseStock(manager: EntityManager, productId: string, rackId: string, quantity: number) {
    const inventory = await manager.findOne(Inventory, {
      where: { product: { id: productId }, rack: { id: rackId } }
    });

    if (!inventory || inventory.quantity < quantity) {
      throw new BadRequestException('Bu rafta yeterli stok bulunmuyor!');
    }

    inventory.quantity -= quantity;
    await manager.save(inventory);
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