import { IsString, Matches, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateRackDto {
    @ApiProperty({ example: 'A1-R1', description: 'Raf Adı (Büyük Harf, Rakam ve Tire içerebilir)' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Z0-9\-]+$/, { message: 'İsimlendirme sadece BÜYÜK HARF, rakam ve tire (-) içerebilir. Boşluk kullanılamaz.' })
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value)
    name: string;

    @ApiProperty({ example: '01', description: 'Raf Kısa Kodu (Maks 10 Karakter)' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Z0-9\-]+$/, { message: 'Kod sadece BÜYÜK HARF, rakam ve tire (-) içerebilir.' })
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value)
    code: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    barcode?: string;

    @ApiProperty()
    @IsNotEmpty()
    aisleId: string;
}