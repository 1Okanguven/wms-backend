import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ description: 'Kategori adı (Örn: Elektronik, Mobilya)' })
    name: string;

    @ApiPropertyOptional({ description: 'Kategori hakkında kısa açıklama' })
    description?: string;
}