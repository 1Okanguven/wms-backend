import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderItem } from './order-item.entity';
import { PickList } from './pick-list.entity';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @ManyToOne(() => Warehouse, { eager: true })
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column()
  warehouseId: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => PickList, (pickList) => pickList.order)
  pickLists: PickList[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
