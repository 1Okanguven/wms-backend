import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Company } from '../../company/entities/company.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 150 })
    name: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    sku: string; // Stock Keeping Unit - Stok Tutma Birimi (Stok kodu)

    @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
    barcode: string; // Fiziksel okutma için barkod

    @Column({ type: 'varchar', length: 100, nullable: true })
    category: string;

    @Column({ default: true })
    isActive: boolean;

    // Ürün şirketin kataloğuna aittir
    @ManyToOne(() => Company, company => company.products, { onDelete: 'CASCADE' })
    company: Company;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}