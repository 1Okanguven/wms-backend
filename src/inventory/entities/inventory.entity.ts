import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Rack } from '../../rack/entities/rack.entity';

@Entity('inventories')
export class Inventory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int', default: 0 })
    quantity: number;

    @ManyToOne(() => Product, product => product.inventories, { onDelete: 'CASCADE' })
    product: Product;

    @ManyToOne(() => Rack, rack => rack.inventories, { onDelete: 'CASCADE' })
    rack: Rack;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}