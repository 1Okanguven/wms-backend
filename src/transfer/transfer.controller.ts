import { Controller, Get, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransferService } from './transfer.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@ApiTags('Transfers')
@Controller('transfer')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class TransferController {
    constructor(private readonly transferService: TransferService) {}

  @Roles(UserRole.ADMIN, UserRole.WORKER)
    @Get('pending/:targetWarehouseId')
    @ApiOperation({ summary: 'Belirli bir depoya doğru yola çıkmış bekleyen transferleri listele' })
    async getPendingTransfers(@Param('targetWarehouseId') targetWarehouseId: string) {
        return await this.transferService.findPendingByWarehouse(targetWarehouseId);
    }

    @Patch(':id/cancel')
    @ApiOperation({ summary: 'Bekleyen bir transferi iptal et ve stokları iade et' })
    async cancelTransfer(@Param('id') id: string, @Req() req: any) {
        return await this.transferService.cancel(id, req.user.id);
    }
}
