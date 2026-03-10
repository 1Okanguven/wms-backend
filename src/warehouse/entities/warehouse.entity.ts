import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Branch } from '../../branch/entities/branch.entity';
import { Zone } from '../../zone/entities/zone.entity';

@Entity('warehouses')
export class Warehouse {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    type: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Branch, branch => branch.warehouses, { onDelete: 'CASCADE' })
    branch: Branch;

    @OneToMany(() => Zone, zone => zone.warehouse)
    zones: Zone[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}