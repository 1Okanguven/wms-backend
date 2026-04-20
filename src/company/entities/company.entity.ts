import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Branch } from '../../branch/entities/branch.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('companies')
export class Company {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 11, unique: true, nullable: true })
    taxNumber: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    taxOffice: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 150, nullable: true })
    website: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    city: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    district: string;

    @Column({ type: 'text', nullable: true })
    detailedAddress: string;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => Branch, branch => branch.company)
    branches: Branch[];

    @OneToMany(() => Product, product => product.company)
    products: Product[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}