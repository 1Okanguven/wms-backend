import { Resolver, Query } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity'; // Kendi dosya yoluna göre düzelt

@Resolver(() => Product)
export class ProductResolver {
    constructor(
        // Mevcut servislerini hiç bozmamak için veritabanı bağlantısını direkt buraya alıyoruz
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) { }

    // İşte GraphQL'in aradığı o kök sorgu!
    @Query(() => [Product], { name: 'getAllProductsWithDetails' })
    async getAllProductsWithDetails(): Promise<Product[]> {
        // TypeORM ile 3 tabloyu (Product, Category, Inventory) birleştirip (JOIN) çekiyoruz
        return await this.productRepository.find({
            relations: ['category', 'inventories'],
        });
    }
}