import { IsString, Matches, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProductDto {
    @ApiProperty({ description: 'Ürün Adı', example: 'Mekanik Oyuncu Klavyesi' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Stok Tutma Birimi (SKU)', example: 'KLV-RGB-001' })
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value)
    sku: string;

    @ApiPropertyOptional({ description: 'Barkod Numarası (EAN-13)', example: '8691234567890' })
    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{13}$/, { message: 'Barkod tam olarak 13 haneli bir rakam olmalıdır.' })
    barcode?: string;

    @ApiProperty({ description: 'Ürünün ekleneceği kategorinin ID değeri (UUID)' })
    @IsNotEmpty()
    categoryId: string;

    @ApiProperty({ description: 'Ürünün ait olduğu şirketin ID değeri (UUID)' })
    @IsNotEmpty()
    companyId: string;

    @ApiProperty({ description: 'Ölçü Birimi (ADET, KG, vb.)', example: 'ADET' })
    @IsString()
    @IsNotEmpty()
    unit: string;

    @ApiPropertyOptional({ description: 'SKT Takibi Zorunlu mu?', example: false })
    @IsOptional()
    @IsBoolean()
    hasExpiration?: boolean;
}