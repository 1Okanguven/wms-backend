export class CreateProductDto {
    name: string;
    sku: string;
    barcode?: string;
    category?: string;
    companyId: string;
}