import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MovementService } from './movement.service';
import { CreateMovementDto } from './dto/create-movement.dto';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@ApiTags('Stok Hareketleri')
@Controller('movement')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class MovementController {
  constructor(private readonly movementService: MovementService) { }

  @ApiOperation({ summary: 'Yeni stok hareketi oluştur (IN / OUT / SHIPMENT / TRANSFER)' })
  @Post()
  create(@Req() req, @Body() createMovementDto: CreateMovementDto) {
    const userId = req.user.userId;
    return this.movementService.create(createMovementDto, userId);
  }

  @ApiOperation({ summary: 'Tüm stok hareketlerini listele (sadece okuma)' })
  @Roles(UserRole.ADMIN, UserRole.WORKER)
  @Get()
  findAll(@Req() req: any) {
    return this.movementService.findAll(req.user);
  }

  @ApiOperation({ summary: 'ID ile tek bir stok hareketi getir' })
  @Roles(UserRole.ADMIN, UserRole.WORKER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movementService.findOne(id);
  }
}
