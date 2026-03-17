import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';
import { Category } from '../../category/entities/category.entity';


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

    // İLİŞKİ: Birden fazla ürün tek bir kategoriye ait olabilir (Many-to-One)
    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'categoryId' }) // Veritabanında categoryId adında bir sütun oluşturur
    category: Category;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    imageUrl: string;

    // Ürün şirketin kataloğuna aittir
    @ManyToOne(() => Company, company => company.products, { onDelete: 'CASCADE' })
    company: Company;

    @OneToMany(() => Inventory, inventory => inventory.product)
    inventories: Inventory[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}