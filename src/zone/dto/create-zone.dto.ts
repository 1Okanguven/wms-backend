import { IsString, Matches, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateZoneDto {
    @ApiProperty({ example: 'A-BLOK', description: 'Bölge Adı (Büyük Harf, Rakam ve Tire içerebilir)' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Z0-9\-]+$/, { message: 'İsimlendirme sadece BÜYÜK HARF, rakam ve tire (-) içerebilir. Boşluk kullanılamaz.' })
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value)
    name: string;

    @ApiProperty({ example: 'A', description: 'Bölge Kısa Kodu (Maks 10 Karakter)' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Z0-9\-]+$/, { message: 'Kod sadece BÜYÜK HARF, rakam ve tire (-) içerebilir.' })
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value)
    code: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiProperty()
    @IsNotEmpty()
    warehouseId: string;
}