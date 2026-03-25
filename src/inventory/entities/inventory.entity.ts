import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Rack } from '../../rack/entities/rack.entity';

@Entity('inventories')
export class Inventory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int', default: 0 })
    quantity: number;

    // YENİ EKLENENLER: Lot Numarası, SKT ve Üretim Tarihi
    @Column({ type: 'varchar', length: 100, nullable: true })
    lotNumber: string;

    @Column({ type: 'date', nullable: true })
    productionDate: Date;

    @Column({ type: 'date', nullable: true })
    expirationDate: Date;

    @ManyToOne(() => Product, product => product.inventories, { onDelete: 'CASCADE' })
    product: Product;

    @ManyToOne(() => Rack, rack => rack.inventories, { onDelete: 'CASCADE' })
    rack: Rack;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}