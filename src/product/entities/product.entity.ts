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
    sku: string;

    @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
    barcode: string;

    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'categoryId' })
    category: Category;


    @Column({ type: 'varchar', length: 50, default: 'ADET' })
    unit: string;

    @Column({ default: false })
    hasExpiration: boolean;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    imageUrl: string;

    @ManyToOne(() => Company, company => company.products, { onDelete: 'RESTRICT' })
    company: Company;

    @OneToMany(() => Inventory, inventory => inventory.product)
    inventories: Inventory[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
