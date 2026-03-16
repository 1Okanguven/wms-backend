import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { Movement } from '../movement/entities/movement.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Movement)
        private readonly movementRepository: Repository<Movement>,
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
    ) { }

    async getSummary() {
        const totalProducts = await this.productRepository.count({
            where: { isActive: true },
        });


        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysMovements = await this.movementRepository
            .createQueryBuilder('movement')
            .where('movement.createdAt >= :today', { today })
            .getCount();


        const lowStockProducts = await this.inventoryRepository
            .createQueryBuilder('inventory')
            .leftJoin('inventory.product', 'product')
            .select('product.name', 'productName')
            .addSelect('product.sku', 'sku')
            .addSelect('SUM(inventory.quantity)', 'totalQuantity')
            .groupBy('product.id')
            .addGroupBy('product.name')
            .addGroupBy('product.sku')
            .having('SUM(inventory.quantity) < :limit', { limit: 20 })
            .getRawMany();

        return {
            overview: {
                totalProducts,
                todaysMovements,
            },
            lowStockAlerts: lowStockProducts.map(item => ({
                ...item,
                totalQuantity: parseInt(item.totalQuantity, 10)
            })),
        };
    }
}