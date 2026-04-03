import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Rack } from '../../rack/entities/rack.entity';
import { User } from '../../user/entities/user.entity';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';

export enum MovementType {
    IN = 'IN',
    OUT = 'OUT',
    SHIPMENT = 'SHIPMENT',
    TRANSFER = 'TRANSFER',
    RETURN = 'RETURN',
    WASTE = 'WASTE',
}

@Entity('movements')
export class Movement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: MovementType })
    type: MovementType;

    @Column('int')
    quantity: number;


    @Column({ type: 'varchar', length: 100, nullable: true })
    referenceNumber: string | null;


    @Column({ type: 'varchar', length: 255, nullable: true })
    destination: string | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    shipmentType: 'INTERNAL' | 'EXTERNAL' | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    customerName: string | null;

    @Column({ type: 'text', nullable: true })
    deliveryAddress: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    shippingCompany: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    trackingNumber: string | null;

    @ManyToOne(() => Warehouse, { nullable: true })
    @JoinColumn({ name: 'targetWarehouseId' })
    targetWarehouse: Warehouse | null;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'productId' })
    product: Product;

    @ManyToOne(() => Rack, { nullable: true })
    @JoinColumn({ name: 'sourceRackId' })
    sourceRack: Rack;

    @ManyToOne(() => Rack, { nullable: true })
    @JoinColumn({ name: 'destinationRackId' })
    destinationRack: Rack;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}