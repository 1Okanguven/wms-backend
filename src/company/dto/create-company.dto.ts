import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
    @ApiProperty({ description: 'Şirket/Tedarikçi Adı', example: 'Logitech Türkiye' })
    name: string;

    @ApiPropertyOptional({ description: '11 Haneli Vergi Kimlik Numarası', example: '12345678901' })
    taxNumber?: string;
}