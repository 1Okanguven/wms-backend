import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';

export enum TransferStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

@Entity('transfers')
export class Transfer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    quantity: number;

    @Column({
        type: 'enum',
        enum: TransferStatus,
        default: TransferStatus.PENDING,
    })
    status: TransferStatus;

    @Column({ type: 'varchar', nullable: true })
    lotNumber: string;

    @Column({ type: 'date', nullable: true })
    productionDate: Date;

    @Column({ type: 'date', nullable: true })
    expirationDate: Date;

    @Column({ type: 'varchar', nullable: true })
    referenceNumber: string;

    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    product: Product;

    @ManyToOne(() => Warehouse, { onDelete: 'CASCADE' })
    sourceWarehouse: Warehouse;

    @ManyToOne(() => Warehouse, { onDelete: 'CASCADE' })
    targetWarehouse: Warehouse;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
