import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { PickList } from './entities/pick-list.entity';
import { PickItem } from './entities/pick-item.entity';
import { OrderStatus } from './enums/order-status.enum';
import { PickListStatus } from './enums/pick-list-status.enum';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Movement, MovementType } from '../movement/entities/movement.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(PickList)
    private readonly pickListRepository: Repository<PickList>,
    @InjectRepository(PickItem)
    private readonly pickItemRepository: Repository<PickItem>,
    private readonly dataSource: DataSource,
  ) { }

  async findAll() {
    return await this.orderRepository.find({
      relations: ['items', 'items.product', 'warehouse'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'warehouse', 'pickLists', 'pickLists.items', 'pickLists.items.sourceRack']
    });
    if (!order) throw new NotFoundException('Sipariş bulunamadı');
    return order;
  }

  async findPickListsByWarehouse(warehouseId: string) {
    return await this.pickListRepository.find({
      where: { order: { warehouseId } },
      relations: ['order', 'items', 'items.product', 'items.sourceRack'],
      order: { createdAt: 'DESC' }
    });
  }

  async getAllPickLists() {
    return await this.pickListRepository.find({
      relations: ['order', 'items', 'items.product', 'items.sourceRack'],
      order: { createdAt: 'DESC' }
    });
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Siparişi Oluştur
      const order = queryRunner.manager.create(Order, {
        customerName: createOrderDto.customerName,
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        warehouseId: createOrderDto.warehouseId,
        status: OrderStatus.PICKING, // Otomatik toplama listesi oluştuğu için direkt PICKING
      });
      const savedOrder = await queryRunner.manager.save(order);

      // 2. Sipariş Kalemlerini ve Toplama Listesini Hazırla
      const pickList = queryRunner.manager.create(PickList, {
        orderId: savedOrder.id,
        status: PickListStatus.PENDING,
      });
      const savedPickList = await queryRunner.manager.save(pickList);
      const pickItems: PickItem[] = [];

      for (const itemDto of createOrderDto.items) {
        // Sipariş kalemi
        const orderItem = queryRunner.manager.create(OrderItem, {
          order: savedOrder,
          product: { id: itemDto.productId },
          quantity: itemDto.quantity,
        });
        const savedOrderItem = await queryRunner.manager.save(orderItem);

        // 3. AKILLI STOK EŞLEŞTİRME (SMART PICKING - FIFO)
        const inventories = await queryRunner.manager.find(Inventory, {
          where: {
            product: { id: itemDto.productId },
            rack: { aisle: { zone: { warehouse: { id: createOrderDto.warehouseId } } } }
          },
          relations: ['rack', 'rack.aisle', 'rack.aisle.zone', 'rack.aisle.zone.warehouse'],
          order: {
            expirationDate: 'ASC',
            createdAt: 'ASC'
          }
        });

        const totalAvailable = inventories.reduce((sum, inv) => sum + inv.quantity, 0);
        if (totalAvailable < itemDto.quantity) {
          throw new BadRequestException(`${itemDto.productId} ID'li ürün için yeterli stok yok! Gereken: ${itemDto.quantity}, Mevcut: ${totalAvailable}`);
        }

        let remainingToPick = itemDto.quantity;
        for (const inventory of inventories) {
          if (remainingToPick <= 0) break;

          const pickQuantity = Math.min(remainingToPick, inventory.quantity);
          const pickItem = queryRunner.manager.create(PickItem, {
            pickListId: savedPickList.id,
            orderItemId: savedOrderItem.id,
            productId: itemDto.productId,
            quantity: pickQuantity,
            sourceRackId: inventory.rack.id,
          });
          const savedPickItem = await queryRunner.manager.save(pickItem);
          pickItems.push(savedPickItem);
          remainingToPick -= pickQuantity;
        }
      }

      await queryRunner.commitTransaction();
      return { ...savedOrder, pickList: { ...savedPickList, items: pickItems } };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async completePickList(pickListId: string, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pickList = await queryRunner.manager.findOne(PickList, {
        where: { id: pickListId },
        relations: ['order', 'items', 'items.product', 'items.sourceRack'],
      });

      if (!pickList) throw new NotFoundException('Toplama listesi bulunamadı');
      if (pickList.status === PickListStatus.COMPLETED) throw new BadRequestException('Bu liste zaten tamamlanmış');

      for (const item of pickList.items) {
        const inventory = await queryRunner.manager.findOne(Inventory, {
          where: { product: { id: item.productId }, rack: { id: item.sourceRackId } },
        });

        if (!inventory || inventory.quantity < item.quantity) {
          throw new BadRequestException(`Stok senkronizasyon problemi! Raf: ${item.sourceRack?.name}`);
        }

        inventory.quantity -= item.quantity;
        await queryRunner.manager.save(inventory);

        const movement = queryRunner.manager.create(Movement, {
          type: MovementType.SHIPMENT,
          quantity: item.quantity,
          referenceNumber: pickList.order.orderNumber,
          product: { id: item.productId },
          sourceRack: { id: item.sourceRackId },
          user: { id: userId },
        });
        await queryRunner.manager.save(movement);
      }

      pickList.status = PickListStatus.COMPLETED;
      await queryRunner.manager.save(pickList);

      pickList.order.status = OrderStatus.READY_FOR_PICKUP;
      await queryRunner.manager.save(pickList.order);

      await queryRunner.commitTransaction();
      return pickList;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
