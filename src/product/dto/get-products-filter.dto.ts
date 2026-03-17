import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetProductsFilterDto {
    @ApiPropertyOptional({
        description: 'Arama kelimesi (Ürün adı veya SKU kodunda arar)'
    })
    search?: string;

    @ApiPropertyOptional({
        description: 'Görüntülemek istediğiniz sayfa numarası',
        default: 1
    })
    page?: number;

    @ApiPropertyOptional({
        description: 'Her sayfada kaç ürün listelenecek?',
        default: 10
    })
    limit?: number;
}