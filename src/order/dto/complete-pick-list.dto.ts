import { ApiProperty } from '@nestjs/swagger';

export class PickedItemDto {
  @ApiProperty({ description: 'Toplanan ürünün ID değeri' })
  productId: string;

  @ApiProperty({ description: 'Ürünün alındığı kaynak rafın ID değeri' })
  sourceRackId: string;

  @ApiProperty({ description: 'Bu raftan kaç adet alındığı' })
  quantity: number;
}

export class CompletePickListDto {
  @ApiProperty({ type: [PickedItemDto], description: 'Görevlinin raftan topladığı ürünlerin listesi' })
  pickedItems: PickedItemDto[];
}
