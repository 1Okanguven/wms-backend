import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Rack } from '../../rack/entities/rack.entity';
import { User } from '../../user/entities/user.entity';

export enum MovementType {
    IN = 'IN',             // Mal Kabul
    OUT = 'OUT',           // Fire / Hasar Çıkışı
    SHIPMENT = 'SHIPMENT', // Müşteriye Sevkiyat
    TRANSFER = 'TRANSFER', // Depo İçi Transfer
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
    referenceNumber: string;

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