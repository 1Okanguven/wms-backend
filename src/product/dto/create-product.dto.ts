import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
    name: string;
    sku: string;
    barcode?: string;

    @ApiProperty({ description: 'Ürünün ekleneceği kategorinin ID değeri (UUID)' })
    categoryId: string;

    @ApiProperty({ description: 'Ürünün ait olduğu şirketin ID değeri (UUID)' })
    companyId: string;
}