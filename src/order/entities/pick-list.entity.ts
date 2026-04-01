import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { PickListStatus } from '../enums/pick-list-status.enum';
import { Order } from './order.entity';
import { User } from '../../user/entities/user.entity';
import { PickItem } from './pick-item.entity';

@Entity('pick_lists')
export class PickList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PickListStatus, default: PickListStatus.PENDING })
  status: PickListStatus;

  @ManyToOne(() => Order, (order) => order.pickLists)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedWorkerId' })
  assignedWorker: User;

  @Column({ nullable: true })
  assignedWorkerId: string;

  @OneToMany(() => PickItem, (item) => item.pickList, { cascade: true })
  items: PickItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
