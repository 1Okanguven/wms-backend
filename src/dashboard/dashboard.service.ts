import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { Movement } from '../movement/entities/movement.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import * as ExcelJS from 'exceljs';

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


    // EXCEL OLUŞTURMA METODU
    async exportLowStockAlerts(): Promise<Buffer> {

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

        const workbook = new ExcelJS.Workbook();

        const worksheet = workbook.addWorksheet('Kritik Stok Raporu');

        worksheet.columns = [
            { header: 'Ürün Adı', key: 'productName', width: 40 },
            { header: 'Stok Kodu (SKU)', key: 'sku', width: 25 },
            { header: 'Kalan Miktar', key: 'totalQuantity', width: 15 },
        ];

        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD32F2F' }
        };

        lowStockProducts.forEach(item => {
            worksheet.addRow({
                productName: item.productName,
                sku: item.sku,
                totalQuantity: parseInt(item.totalQuantity, 10),
            });
        });

        return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
    }
}