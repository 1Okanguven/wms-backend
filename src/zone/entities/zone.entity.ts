import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';
import { Aisle } from '../../aisle/entities/aisle.entity';

@Entity('zones')
@Unique(['warehouse', 'code'])
export class Zone {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    code: string;

    @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
    locationCode: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    type: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Warehouse, warehouse => warehouse.zones, { onDelete: 'CASCADE' })
    warehouse: Warehouse;

    @OneToMany(() => Aisle, aisle => aisle.zone)
    aisles: Aisle[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}