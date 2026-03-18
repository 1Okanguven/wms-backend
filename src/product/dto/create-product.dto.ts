import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ description: 'Ürün Adı', example: 'Mekanik Oyuncu Klavyesi' })
    name: string;

    @ApiProperty({ description: 'Stok Tutma Birimi (SKU)', example: 'KLV-RGB-001' })
    sku: string;

    @ApiPropertyOptional({ description: 'Barkod Numarası (Opsiyonel)', example: '8691234567890' })
    barcode?: string;

    @ApiProperty({ description: 'Ürünün ekleneceği kategorinin ID değeri (UUID)' })
    categoryId: string;

    @ApiProperty({ description: 'Ürünün ait olduğu şirketin ID değeri (UUID)' })
    companyId: string;
}