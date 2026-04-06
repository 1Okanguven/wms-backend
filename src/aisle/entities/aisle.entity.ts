import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { Zone } from '../../zone/entities/zone.entity';
import { Rack } from '../../rack/entities/rack.entity';

@Entity('aisles')
@Unique(['zone', 'code'])
export class Aisle {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    code: string;

    @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
    locationCode: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Zone, zone => zone.aisles, { onDelete: 'RESTRICT' })
    zone: Zone;

    @OneToMany(() => Rack, rack => rack.aisle)
    racks: Rack[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
