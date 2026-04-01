import { IsArray, IsNotEmpty, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ description: 'Ürün (Product) UUID' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Sipariş edilecek miktar', minimum: 1 })
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Müşteri Adı' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ description: 'Hangi Şube/Depo üzerinden karşılanacak' })
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({ type: [OrderItemDto], description: 'Siparişteki ürünler listesi' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
