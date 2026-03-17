import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Product } from '../../product/entities/product.entity'; // Ürün tablosunu bağlıyoruz

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string; // Örn: Elektronik, Kırtasiye

    @Column({ nullable: true })
    description: string;

    // İLİŞKİ: Bir kategorinin birden fazla ürünü olabilir (One-to-Many)
    @OneToMany(() => Product, (product) => product.category)
    products: Product[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
