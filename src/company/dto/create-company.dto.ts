import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCompanyDto {
    @ApiProperty({ description: 'Şirket/Tedarikçi Adı', example: 'Logitech Türkiye' })
    name: string;

    @ApiPropertyOptional({ description: '11 Haneli Vergi Kimlik Numarası', example: '12345678901' })
    taxNumber?: string;

    @ApiPropertyOptional({ description: 'İl', example: 'İstanbul' })
    @IsString()
    @IsOptional()
    city?: string;

    @ApiPropertyOptional({ description: 'İlçe', example: 'Kadıköy' })
    @IsString()
    @IsOptional()
    district?: string;

    @ApiPropertyOptional({ description: 'Açık Adres' })
    @IsString()
    @IsOptional()
    detailedAddress?: string;
}