import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { Movement } from '../movement/entities/movement.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
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


        const inventorySum = await this.inventoryRepository
            .createQueryBuilder('inventory')
            .select('SUM(inventory.quantity)', 'total')
            .getRawOne();

        const totalStock = parseInt(inventorySum.total, 10) || 0;

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
                totalStock,
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

    // Mevcut exportLowStockAlerts() metodunun hemen altına bu yeni metodu ekle:
    async exportLowStockAlertsPdf(): Promise<Buffer> {
        // 1. Veriyi çekiyoruz (Excel metodundaki ile birebir aynı sorgu)
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

        // 2. PDF oluşturma işlemini bir Promise içine alıyoruz ki Buffer tamamen dolana kadar beklesin
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            // PDF verisi oluştukça buffers dizisine ekle
            doc.on('data', buffers.push.bind(buffers));

            // İşlem bittiğinde dizideki tüm parçaları tek bir Buffer yap ve resolve et
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', reject);

            doc.fontSize(20).text('Kritik Stok Raporu', { align: 'center' });
            doc.moveDown(2);

            doc.fontSize(12).font('Helvetica-Bold');
            doc.text('Ürün Adi', 50, doc.y, { continued: true, width: 250 });
            doc.text('SKU', 300, doc.y, { continued: true, width: 150 });
            doc.text('Kalan', 450, doc.y);
            doc.moveDown(0.5);

            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            doc.font('Helvetica');
            lowStockProducts.forEach(item => {
                const productName = item.productName || 'Bilinmeyen Ürün';
                const sku = item.sku || '-';
                const qty = String(parseInt(item.totalQuantity, 10));

                doc.text(productName, 50, doc.y, { continued: true, width: 250 });
                doc.text(sku, 300, doc.y, { continued: true, width: 150 });
                doc.text(qty, 450, doc.y);
                doc.moveDown(0.5);
            });

            // PDF'i sonlandır (Bu tetiklendiğinde yukarıdaki doc.on('end') çalışır)
            doc.end();
        });
    }

}