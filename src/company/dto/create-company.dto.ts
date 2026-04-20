import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCompanyDto {
    @ApiProperty({ description: 'Şirket/Tedarikçi Adı', example: 'Logitech Türkiye' })
    name: string;

    @ApiPropertyOptional({ description: '11 Haneli Vergi Kimlik Numarası', example: '12345678901' })
    @IsString()
    @IsOptional()
    taxNumber?: string;

    @ApiPropertyOptional({ description: 'Vergi Dairesi', example: 'Maslak' })
    @IsString()
    @IsOptional()
    taxOffice?: string;

    @ApiPropertyOptional({ description: 'E-Posta Adresi', example: 'info@logitech.com' })
    @IsString()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ description: 'Telefon Numarası', example: '0212 123 45 67' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ description: 'Web Sitesi', example: 'https://www.logitech.com' })
    @IsString()
    @IsOptional()
    website?: string;

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