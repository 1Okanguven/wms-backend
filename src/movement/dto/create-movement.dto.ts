import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { MovementType } from '../entities/movement.entity';

export class CreateMovementDto {
    @ApiProperty({
        description: 'Hareketin tipi: IN (Mal Kabul), OUT (Fire/Hasar), SHIPMENT (Sevkiyat) veya TRANSFER',
        enum: MovementType,
    })
    @IsEnum(MovementType)
    type: MovementType;

    @ApiProperty({
        description: 'İşlem görecek ürünün adedi (Örn: 15, 600)',
    })
    @IsInt()
    @Min(1)
    quantity: number;

    @ApiPropertyOptional({
        description: 'Fatura, irsaliye veya sipariş numarası gibi resmi referans kodu',
    })
    @IsOptional()
    @IsString()
    referenceNumber?: string;

    @ApiProperty({
        description: 'İşlem yapılacak ürünün ID değeri (UUID formatında)',
    })
    @IsUUID()
    productId: string;

    @ApiPropertyOptional({
        description: 'Ürünün alınacağı kaynak rafın ID değeri (OUT, SHIPMENT ve TRANSFER için doldurulmalı)',
    })
    @IsOptional()
    @IsUUID()
    sourceRackId?: string;

    @ApiPropertyOptional({
        description: 'Ürünün yerleştirileceği hedef rafın ID değeri (IN ve TRANSFER için doldurulmalı)',
    })
    @IsOptional()
    @IsUUID()
    destinationRackId?: string;
}