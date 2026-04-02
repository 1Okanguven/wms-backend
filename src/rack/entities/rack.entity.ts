import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { Aisle } from '../../aisle/entities/aisle.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';

@Entity('racks')
@Unique(['aisle', 'code'])
export class Rack {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    code: string;

    @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
    locationCode: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    barcode: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Aisle, aisle => aisle.racks, { onDelete: 'CASCADE' })
    aisle: Aisle;

    @OneToMany(() => Inventory, inventory => inventory.rack)
    inventories: Inventory[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}