import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReceivingService } from './receiving.service';
import { CreateReceivingDto } from './dto/create-receiving.dto';

@ApiTags('Mal Kabul (Receiving)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('receiving')
export class ReceivingController {
    constructor(private readonly receivingService: ReceivingService) {}

    @ApiOperation({
        summary: 'Mal kabul işlemi yap',
        description:
            'Ürünü belirtilen rafa ekler (stok günceller) ve otomatik olarak Stok Hareketi (type: IN) logu oluşturur.',
    })
    @Post()
    create(@Req() req, @Body() dto: CreateReceivingDto) {
        const userId = req.user.userId;
        return this.receivingService.receive(dto, userId);
    }
}
