import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Rack } from '../../rack/entities/rack.entity';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity('inventories')
export class Inventory {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column({ type: 'int', default: 0 })
    quantity: number;

    @Field({ nullable: true })
    @Column({ type: 'varchar', length: 100, nullable: true })
    lotNumber: string;

    @Field({ nullable: true })
    @Column({ type: 'date', nullable: true })
    productionDate: Date;

    @Field({ nullable: true })
    @Column({ type: 'date', nullable: true })
    expirationDate: Date;

    @Field(() => Product) // Ürün bilgisine GraphQL üzerinden erişilebilir
    @ManyToOne(() => Product, product => product.inventories, { onDelete: 'RESTRICT' })
    product: Product;

    // DİKKAT: @Field KOYMADIM! Rack entity'si henüz GraphQL'e tanıtılmadığı için 
    // buraya koyarsak sunucu çöker. Şu an için sadece veritabanı seviyesinde kalacak.
    @ManyToOne(() => Rack, rack => rack.inventories, { onDelete: 'RESTRICT' })
    rack: Rack;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;
}