import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';

export enum UserRole {
    ADMIN = 'ADMIN',
    WORKER = 'WORKER',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.WORKER })
    role: UserRole;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    warehouseId: string;

    @ManyToOne(() => Warehouse, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'warehouseId' })
    warehouse: Warehouse;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}