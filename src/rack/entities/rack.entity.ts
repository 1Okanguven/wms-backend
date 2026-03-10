import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Aisle } from '../../aisle/entities/aisle.entity';

@Entity('racks')
export class Rack {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    barcode: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Aisle, aisle => aisle.racks, { onDelete: 'CASCADE' })
    aisle: Aisle;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}