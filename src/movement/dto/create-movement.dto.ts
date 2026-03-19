import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '../entities/movement.entity';

export class CreateMovementDto {
    @ApiProperty({
        description: 'Hareketin tipi: IN (Mal Kabul), OUT (Fire/Hasar), SHIPMENT (Sevkiyat) veya TRANSFER',
        enum: MovementType,
    })
    type: MovementType;

    @ApiProperty({
        description: 'İşlem görecek ürünün adedi (Örn: 15, 600)',
    })
    quantity: number;

    @ApiPropertyOptional({
        description: 'Fatura, irsaliye veya sipariş numarası gibi resmi referans kodu',
    })
    referenceNumber?: string;

    @ApiProperty({
        description: 'İşlem yapılacak ürünün ID değeri (UUID formatında)',
    })
    productId: string;

    @ApiPropertyOptional({
        description: 'Ürünün alınacağı kaynak rafın ID değeri (OUT, SHIPMENT ve TRANSFER için doldurulmalı)',
    })
    sourceRackId?: string;

    @ApiPropertyOptional({
        description: 'Ürünün yerleştirileceği hedef rafın ID değeri (IN ve TRANSFER için doldurulmalı)',
    })
    destinationRackId?: string;
}