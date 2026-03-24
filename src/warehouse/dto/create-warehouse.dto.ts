import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseDto {
    @ApiProperty({ description: 'Depo Adı', example: 'Antalya Merkez Depo' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ description: 'Depo Tipi', example: 'Soğuk Hava' })
    @IsString()
    @IsOptional()
    type?: string;

    @ApiProperty({ description: 'Bağlı Olduğu Şube/Firma ID' })
    @IsString()
    @IsNotEmpty()
    branchId: string;

    @ApiPropertyOptional({ description: 'İl', example: 'Antalya' })
    @IsString()
    @IsOptional()
    city?: string;

    @ApiPropertyOptional({ description: 'İlçe', example: 'Gazipaşa' })
    @IsString()
    @IsOptional()
    district?: string;

    @ApiPropertyOptional({ description: 'Açık Adres' })
    @IsString()
    @IsOptional()
    detailedAddress?: string;
}