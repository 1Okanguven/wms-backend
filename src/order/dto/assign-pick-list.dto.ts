import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPickListDto {
  @ApiProperty({ description: 'Atanacak Siparişin ID si' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'Atanacak Görevlinin ID si' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
