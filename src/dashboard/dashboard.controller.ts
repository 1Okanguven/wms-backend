import { Controller, Get, UseGuards, Res, StreamableFile, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiOkResponse, ApiProduces } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import type { Response } from 'express';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('summary')
    @Roles(UserRole.ADMIN, UserRole.WORKER)
    @ApiOperation({ summary: 'Yönetici özet istatistiklerini getirir' })
    getSummary() {
        return this.dashboardService.getSummary();
    }

    @Get('export/low-stock')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Kritik stoktaki ürünleri Excel (.xlsx) olarak indirir' })
    @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    async downloadLowStockReport(@Res() res: Response) {

        const buffer = await this.dashboardService.exportLowStockAlerts();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Kritik_Stok_Raporu.xlsx"');

        res.end(buffer);
    }


    @Get('export/low-stock/pdf')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Kritik stoktaki ürünleri PDF olarak indirir' })
    @ApiProduces('application/pdf')
    async downloadLowStockReportPdf(@Res() res: Response) {

        const buffer = await this.dashboardService.exportLowStockAlertsPdf();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Kritik_Stok_Raporu.pdf"');

        res.end(buffer);
    }

}



