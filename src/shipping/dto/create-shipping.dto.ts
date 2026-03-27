import { IsString, IsInt, Min, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateShippingDto {
    @ApiProperty({ description: 'Sevk edilecek ürünün ID\'si' })
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ description: 'Ürünün çekileceği rafın ID\'si' })
    @IsString()
    @IsNotEmpty()
    rackId: string;

    @ApiProperty({ description: 'Sevk edilecek miktar', minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    quantity: number;

    @ApiProperty({ description: 'Sevkiyat Türü', enum: ['INTERNAL', 'EXTERNAL'] })
    @IsString()
    @IsNotEmpty()
    shipmentType: 'INTERNAL' | 'EXTERNAL';

    @ApiPropertyOptional({ description: 'Alıcı, Şube veya Hedef Depo adı (INTERNAL için zorunlu)', example: 'Kadıköy Şubesi' })
    @IsString()
    @IsOptional()
    destination?: string;

    @ApiPropertyOptional({ description: 'Müşteri Adı/Soyadı (EXTERNAL için)', example: 'Ahmet Yılmaz' })
    @IsString()
    @IsOptional()
    customerName?: string;

    @ApiPropertyOptional({ description: 'Teslimat Adresi (EXTERNAL için)', example: 'Atatürk Mah. No:1' })
    @IsString()
    @IsOptional()
    deliveryAddress?: string;

    @ApiPropertyOptional({ description: 'Kargo Firması (EXTERNAL için)', example: 'Yurtiçi Kargo' })
    @IsString()
    @IsOptional()
    shippingCompany?: string;

    @ApiPropertyOptional({ description: 'Kargo Takip No (EXTERNAL için)', example: '123456789' })
    @IsString()
    @IsOptional()
    trackingNumber?: string;

    @ApiPropertyOptional({ description: 'Hedef Depo ID (INTERNAL için)', example: 'uuid' })
    @IsString()
    @IsOptional()
    targetWarehouseId?: string;

    @ApiPropertyOptional({ description: 'İrsaliye, Sipariş veya PO Numarası', example: 'IRV-2024-001' })
    @IsOptional()
    @IsString()
    referenceNumber?: string;
}
