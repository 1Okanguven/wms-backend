import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Rack } from '../../rack/entities/rack.entity';
import { User } from '../../user/entities/user.entity';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';

export enum MovementType {
    IN = 'IN',             // Mal Kabul
    OUT = 'OUT',           // Fire / Hasar Çıkışı
    SHIPMENT = 'SHIPMENT', // Müşteriye Sevkiyat
    TRANSFER = 'TRANSFER', // Depo İçi Transfer
    RETURN = 'RETURN',     // İptal / İade
}

@Entity('movements')
export class Movement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: MovementType })
    type: MovementType;

    @Column('int')
    quantity: number;

    // Fatura No, İrsaliye No veya Sipariş Kodu gibi resmi referanslar
    @Column({ type: 'varchar', length: 100, nullable: true })
    referenceNumber: string | null;

    // Alıcı, Şube veya Hedef Depo adı (Sevkiyat işlemlerinde kullanılır)
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