import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { Movement } from '../movement/entities/movement.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Warehouse } from '../warehouse/entities/warehouse.entity';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Movement)
        private readonly movementRepository: Repository<Movement>,
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
        @InjectRepository(Warehouse)
        private readonly warehouseRepository: Repository<Warehouse>,
    ) { }

    async getSummary(user: any) {
        const isWorker = user.role === 'WORKER';
        const warehouseId = user.warehouseId;

        // Toplam Ürün (Globaldir, aktif olan tüm ürünler)
        const productQuery = this.productRepository.createQueryBuilder('product')
            .where('product.isActive = :isActive', { isActive: true });

        const totalProducts = await productQuery.getCount();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Bugünkü Hareketler (Eğer worker ise kendi deposuna ait hareketler)
        const movementQuery = this.movementRepository
            .createQueryBuilder('movement')
            .where('movement.createdAt >= :today', { today });

        if (isWorker && warehouseId) {
            // Worker için hareketleri depo bazlı filtrele (giriş veya çıkış rafı bu depoya aitse)
            movementQuery
                .leftJoin('movement.sourceRack', 'sRack')
                .leftJoin('sRack.aisle', 'sAisle')
                .leftJoin('sAisle.zone', 'sZone')
                .leftJoin('movement.destinationRack', 'dRack')
                .leftJoin('dRack.aisle', 'dAisle')
                .leftJoin('dAisle.zone', 'dZone')
                .andWhere('(sZone.warehouseId = :warehouseId OR dZone.warehouseId = :warehouseId)', { warehouseId });
        }

        const todaysMovements = await movementQuery.getCount();


        // Toplam Stok (Miktar bazlı, worker ise sadece kendi deposu)
        const inventoryQuery = this.inventoryRepository
            .createQueryBuilder('inventory')
            .select('SUM(inventory.quantity)', 'total');

        if (isWorker && warehouseId) {
            inventoryQuery
                .innerJoin('inventory.rack', 'rack')
                .innerJoin('rack.aisle', 'aisle')
                .innerJoin('aisle.zone', 'zone')
                .where('zone.warehouseId = :warehouseId', { warehouseId });
        }

        const inventorySum = await inventoryQuery.getRawOne();

        const totalStock = parseInt(inventorySum?.total, 10) || 0;

        // Depo Sayısı (Admin için hepsi, Worker için 1 adet)
        const warehouseQuery = this.warehouseRepository.createQueryBuilder('warehouse')
            .where('warehouse.isActive = :isActive', { isActive: true });

        if (isWorker && warehouseId) {
            warehouseQuery.andWhere('warehouse.id = :warehouseId', { warehouseId });
        }

        const totalWarehouses = await warehouseQuery.getCount();

        const lowStockQuery = this.inventoryRepository
            .createQueryBuilder('inventory')
            .leftJoin('inventory.product', 'product')
            .leftJoin('inventory.rack', 'rack')
            .leftJoin('rack.aisle', 'aisle')
            .leftJoin('aisle.zone', 'zone')
            .leftJoin('zone.warehouse', 'warehouse')
            .select('product.name', 'productName')
            .addSelect('product.sku', 'sku')
            .addSelect('warehouse.name', 'warehouseName')
            .addSelect('SUM(inventory.quantity)', 'totalQuantity')
            .where('inventory.quantity > 0')
            .groupBy('product.id')
            .addGroupBy('product.name')
            .addGroupBy('product.sku')
            .addGroupBy('warehouse.id')
            .addGroupBy('warehouse.name')
            .having('SUM(inventory.quantity) < :limit', { limit: 20 });

        if (isWorker && warehouseId) {
            lowStockQuery.andWhere('warehouse.id = :warehouseId', { warehouseId });
        }

        const lowStockProducts = await lowStockQuery.getRawMany();

        return {
            overview: {
                totalProducts,
                totalStock,
                todaysMovements,
                totalWarehouses,
            },
            lowStockAlerts: lowStockProducts.map(item => ({
                ...item,
                totalQuantity: parseInt(item.totalQuantity, 10)
            })),
        };
    }



    async exportLowStockAlerts(): Promise<Buffer> {

        const lowStockProducts = await this.inventoryRepository
            .createQueryBuilder('inventory')
            .leftJoin('inventory.product', 'product')
            .leftJoin('inventory.rack', 'rack')
            .leftJoin('rack.aisle', 'aisle')
            .leftJoin('aisle.zone', 'zone')
            .leftJoin('zone.warehouse', 'warehouse')
            .select('product.name', 'productName')
            .addSelect('product.sku', 'sku')
            .addSelect('warehouse.name', 'warehouseName')
            .addSelect('SUM(inventory.quantity)', 'totalQuantity')
            .where('inventory.quantity > 0')
            .groupBy('product.id')
            .addGroupBy('product.name')
            .addGroupBy('product.sku')
            .addGroupBy('warehouse.id')
            .addGroupBy('warehouse.name')
            .having('SUM(inventory.quantity) < :limit', { limit: 20 })
            .getRawMany();

        const workbook = new ExcelJS.Workbook();

        const worksheet = workbook.addWorksheet('Kritik Stok Raporu');

        worksheet.columns = [
            { header: 'Ürün Adı', key: 'productName', width: 40 },
            { header: 'Stok Kodu (SKU)', key: 'sku', width: 25 },
            { header: 'Lokasyon', key: 'warehouseName', width: 25 },
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
                warehouseName: item.warehouseName || 'Bilinmiyor',
                totalQuantity: parseInt(item.totalQuantity, 10),
            });
        });

        return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
    }

    async exportLowStockAlertsPdf(): Promise<Buffer> {
        const lowStockProducts = await this.inventoryRepository
            .createQueryBuilder('inventory')
            .leftJoin('inventory.product', 'product')
            .leftJoin('inventory.rack', 'rack')
            .leftJoin('rack.aisle', 'aisle')
            .leftJoin('aisle.zone', 'zone')
            .leftJoin('zone.warehouse', 'warehouse')
            .select('product.name', 'productName')
            .addSelect('product.sku', 'sku')
            .addSelect('warehouse.name', 'warehouseName')
            .addSelect('SUM(inventory.quantity)', 'totalQuantity')
            .where('inventory.quantity > 0')
            .groupBy('product.id')
            .addGroupBy('product.name')
            .addGroupBy('product.sku')
            .addGroupBy('warehouse.id')
            .addGroupBy('warehouse.name')
            .having('SUM(inventory.quantity) < :limit', { limit: 20 })
            .getRawMany();

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];
            doc.on('data', buffers.push.bind(buffers));

            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', reject);

            doc.fontSize(20).text('Kritik Stok Raporu', { align: 'center' });
            doc.moveDown(2);

            doc.fontSize(12).font('Helvetica-Bold');
            doc.text('Ürün Adi', 50, doc.y, { continued: true, width: 200 });
            doc.text('SKU', 260, doc.y, { continued: true, width: 100 });
            doc.text('Lokasyon', 370, doc.y, { continued: true, width: 120 });
            doc.text('Kalan', 500, doc.y);
            doc.moveDown(0.5);

            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            doc.font('Helvetica');
            lowStockProducts.forEach(item => {
                const productName = item.productName || 'Bilinmeyen Ürün';
                const sku = item.sku || '-';
                const whName = item.warehouseName || 'Bilinmiyor';
                const qty = String(parseInt(item.totalQuantity, 10));

                doc.text(productName, 50, doc.y, { continued: true, width: 200 });
                doc.text(sku, 260, doc.y, { continued: true, width: 100 });
                doc.text(whName, 370, doc.y, { continued: true, width: 120 });
                doc.text(qty, 500, doc.y);
                doc.moveDown(0.5);
            });

            doc.end();
        });
    }

}