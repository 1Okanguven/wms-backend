import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Rack } from '../../rack/entities/rack.entity';

@Entity('inventories')
export class Inventory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int', default: 0 })
    quantity: number;


    @Column({ type: 'varchar', length: 100, nullable: true })
    lotNumber: string;

    @Column({ type: 'date', nullable: true })
    productionDate: Date;

    @Column({ type: 'date', nullable: true })
    expirationDate: Date;

    @ManyToOne(() => Product, product => product.inventories, { onDelete: 'RESTRICT' })
    product: Product;

    @ManyToOne(() => Rack, rack => rack.inventories, { onDelete: 'RESTRICT' })
    rack: Rack;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
