import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Zone } from '../../zone/entities/zone.entity';
import { Rack } from '../../rack/entities/rack.entity';

@Entity('aisles')
export class Aisle {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Zone, zone => zone.aisles, { onDelete: 'CASCADE' })
    zone: Zone;

    @OneToMany(() => Rack, rack => rack.aisle)
    racks: Rack[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}