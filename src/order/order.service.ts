import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { AssignPickListDto } from './dto/assign-pick-list.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { PickList } from './entities/pick-list.entity';
import { OrderStatus } from './enums/order-status.enum';
import { PickListStatus } from './enums/pick-list-status.enum';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Movement, MovementType } from '../movement/entities/movement.entity';
import { CompletePickListDto } from './dto/complete-pick-list.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(PickList)
    private readonly pickListRepository: Repository<PickList>,
    private readonly dataSource: DataSource,
  ) { }

  async createOrder(createOrderDto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = queryRunner.manager.create(Order, {
        customerName: createOrderDto.customerName,
        orderNumber: `ORD-${Date.now()}`,
        status: OrderStatus.PENDING,
      });
      const savedOrder = await queryRunner.manager.save(order);

      const orderItems = createOrderDto.items.map((item) =>
        queryRunner.manager.create(OrderItem, {
          order: savedOrder,
          product: { id: item.productId },
          quantity: item.quantity,
        }),
      );
      await queryRunner.manager.save(orderItems);

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async assignPickList(assignPickListDto: AssignPickListDto) {
    const order = await this.orderRepository.findOneBy({ id: assignPickListDto.orderId });
    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    order.status = OrderStatus.PROCESSING;
    await this.orderRepository.save(order);

    const pickList = this.pickListRepository.create({
      order: { id: order.id },
      assignedWorker: { id: assignPickListDto.userId },
      status: PickListStatus.PENDING,
    });

    return await this.pickListRepository.save(pickList);
  }

  async completePickList(pickListId: string, completeDto: CompletePickListDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pickList = await queryRunner.manager.findOne(PickList, {
        where: { id: pickListId },
        relations: ['order'],
      });

      if (!pickList) {
        throw new NotFoundException('Toplama listesi bulunamadı');
      }

      for (const item of completeDto.pickedItems) {
        const inventory = await queryRunner.manager.findOne(Inventory, {
          where: { product: { id: item.productId }, rack: { id: item.sourceRackId } },
        });

        if (!inventory || inventory.quantity < item.quantity) {
          throw new BadRequestException(`Yetersiz stok! Ürün ID: ${item.productId}, Raf ID: ${item.sourceRackId} rafinda yeterli ürün bulunmuyor.`);
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

      pickList.order.status = OrderStatus.COMPLETED;
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

