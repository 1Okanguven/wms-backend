import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsInt, IsOptional, IsString, IsDateString, Min } from 'class-validator';

export class CreateReceivingDto {
    @ApiProperty({ description: 'Mal kabul yapılacak ürünün ID değeri (UUID)' })
    @IsUUID()
    productId: string;

    @ApiProperty({ description: 'Ürünün yerleştirileceği rafın ID değeri (UUID)' })
    @IsUUID()
    rackId: string;

    @ApiProperty({ description: 'Gelen ürün adedi', example: 100 })
    @IsInt()
    @Min(1)
    quantity: number;

    @ApiPropertyOptional({ description: 'Parti/Lot Numarası', example: 'LOT-2026-001' })
    @IsOptional()
    @IsString()
    lotNumber?: string;

    @ApiPropertyOptional({ description: 'Üretim Tarihi (YYYY-MM-DD)', example: '2024-01-15' })
    @IsOptional()
    @IsDateString()
    productionDate?: string;

    @ApiPropertyOptional({ description: 'Son Kullanma Tarihi (YYYY-MM-DD)', example: '2026-12-31' })
    @IsOptional()
    @IsDateString()
    expirationDate?: string;

    @ApiPropertyOptional({ description: 'İç transfer ID değeri (Internal transfer için)' })
    @IsOptional()
    @IsUUID()
    transferId?: string;
}
