import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PickListStatus } from '../enums/pick-list-status.enum';
import { Order } from './order.entity';
import { User } from '../../user/entities/user.entity';

@Entity('pick_lists')
export class PickList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PickListStatus, default: PickListStatus.PENDING })
  status: PickListStatus;

  @ManyToOne(() => Order, (order) => order.pickLists)
  order: Order;

  @ManyToOne(() => User)
  assignedWorker: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
