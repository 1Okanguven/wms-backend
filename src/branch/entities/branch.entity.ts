import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';

@Entity('branches')
export class Branch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Company, company => company.branches, { onDelete: 'CASCADE' })
    company: Company;

    @OneToMany(() => Warehouse, warehouse => warehouse.branch)
    warehouses: Warehouse[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}