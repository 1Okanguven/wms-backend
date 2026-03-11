import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Rack } from '../../rack/entities/rack.entity';

export enum MovementType {
    IN = 'IN', // Mal Kabul
    OUT = 'OUT', // Sevkiyat
    TRANSFER = 'TRANSFER', // Depo İçi Transfer
}

@Entity('movements')
export class Movement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: MovementType })
    type: MovementType;

    @Column({ type: 'int' })
    quantity: number;

    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    product: Product;

    // Çıkış yapılan raf (Mal kabulde boş kalabilir)
    @ManyToOne(() => Rack, { nullable: true, onDelete: 'SET NULL' })
    sourceRack: Rack;

    // Giriş yapılan raf (Sevkiyatta boş kalabilir)
    @ManyToOne(() => Rack, { nullable: true, onDelete: 'SET NULL' })
    destinationRack: Rack;

    @CreateDateColumn()
    createdAt: Date; // İşlemin yapıldığı an
}