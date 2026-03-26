import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { CreateShippingDto } from './dto/create-shipping.dto';

@ApiTags('Sevkiyat (Shipping)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('shipping')
export class ShippingController {
    constructor(private readonly shippingService: ShippingService) {}

    @ApiOperation({
        summary: 'Sevkiyat işlemi yap',
        description:
            'Belirtilen raftan ürün stokunu düşer ve otomatik olarak Stok Hareketi (type: SHIPMENT) logu oluşturur.',
    })
    @Post()
    create(@Req() req, @Body() dto: CreateShippingDto) {
        const userId = req.user.userId;
        return this.shippingService.ship(dto, userId);
    }
}
