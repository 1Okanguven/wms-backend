import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';
import { Category } from '../../category/entities/category.entity';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType() // Sınıfı GraphQL'e tanıtır (Sadece bir tane olması yeterlidir)
@Entity('products')
export class Product {

    @Field(() => ID) // Bunun bir ID olduğunu belirtiriz
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field() // Normal okunabilir kolon
    @Column({ type: 'varchar', length: 150 })
    name: string;

    @Field()
    @Column({ type: 'varchar', length: 50, unique: true })
    sku: string;

    @Field({ nullable: true }) // Veritabanında nullable ise GraphQL'de de belirtmeliyiz
    @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
    barcode: string;

    @Field(() => Category, { nullable: true }) // İlişkili objeyi bağlıyoruz
    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @Field()
    @Column({ type: 'varchar', length: 50, default: 'ADET' })
    unit: string;

    @Field()
    @Column({ default: false })
    hasExpiration: boolean;

    @Field()
    @Column({ default: true })
    isActive: boolean;

    @Field({ nullable: true })
    @Column({ nullable: true })
    imageUrl: string;

    // DİKKAT: @Field KOYMADIM! Çünkü frontend'in hangi şirkete/kiracıya 
    // ait olduğunu görmesine veya sorgulamasına gerek yok. Gizli kalmalı.
    @ManyToOne(() => Company, company => company.products, { onDelete: 'RESTRICT' })
    company: Company;

    @Field(() => [Inventory], { nullable: true }) // Birden fazla stok kaydı geleceği için [] dizisi kullanıyoruz
    @OneToMany(() => Inventory, inventory => inventory.product)
    inventories: Inventory[];

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;
}