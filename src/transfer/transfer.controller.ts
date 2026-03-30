import { Controller, Get, Param } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Transfers')
@Controller('transfer')
export class TransferController {
    constructor(private readonly transferService: TransferService) {}

    @Get('pending/:targetWarehouseId')
    @ApiOperation({ summary: 'Belirli bir depoya doğru yola çıkmış bekleyen transferleri listele' })
    async getPendingTransfers(@Param('targetWarehouseId') targetWarehouseId: string) {
        return await this.transferService.findPendingByWarehouse(targetWarehouseId);
    }
}
