import { IsString, Matches, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateAisleDto {
    @ApiProperty({ example: 'KORIDOR-01', description: 'Koridor Adı (Büyük Harf, Rakam ve Tire içerebilir)' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Z0-9\-]+$/, { message: 'İsimlendirme sadece BÜYÜK HARF, rakam ve tire (-) içerebilir. Boşluk kullanılamaz.' })
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value)
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    zoneId: string;
}