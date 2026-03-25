import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryDto {
    @ApiProperty({ description: 'Stoka eklenecek ürünün ID değeri' })
    productId: string;

    @ApiProperty({ description: 'Ürünün yerleştirileceği rafın ID değeri' })
    rackId: string;

    @ApiProperty({ description: 'Miktar', example: 100 })
    quantity: number;

    @ApiPropertyOptional({ description: 'Parti/Lot Numarası', example: 'LOT-2026-001' })
    lotNumber?: string;

    @ApiPropertyOptional({ description: 'Üretim Tarihi (YYYY-MM-DD)', example: '2024-01-15' })
    productionDate?: Date;

    @ApiPropertyOptional({ description: 'Son Kullanma Tarihi (YYYY-MM-DD)', example: '2026-12-31' })
    expirationDate?: Date;
}