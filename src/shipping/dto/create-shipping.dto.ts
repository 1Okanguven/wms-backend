import { IsString, IsInt, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateShippingDto {
    @ApiProperty({ description: 'Sevk edilecek ürünün ID\'si' })
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ description: 'Ürünün çekileceği rafın ID\'si' })
    @IsString()
    @IsNotEmpty()
    rackId: string;

    @ApiProperty({ description: 'Sevk edilecek miktar', minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    quantity: number;
}
