import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PickList } from './pick-list.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../../product/entities/product.entity';
import { Rack } from '../../rack/entities/rack.entity';

@Entity('pick_items')
export class PickItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  quantity: number;

  @ManyToOne(() => PickList, (pickList) => pickList.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pickListId' })
  pickList: PickList;

  @Column()
  pickListId: string;

  @ManyToOne(() => OrderItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderItemId' })
  orderItem: OrderItem;

  @Column()
  orderItemId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => Rack)
  @JoinColumn({ name: 'sourceRackId' })
  sourceRack: Rack;

  @Column()
  sourceRackId: string;
}
