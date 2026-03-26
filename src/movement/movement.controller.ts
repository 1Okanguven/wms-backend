import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MovementService } from './movement.service';
import { CreateMovementDto } from './dto/create-movement.dto';

@ApiTags('Stok Hareketleri')
@Controller('movement')
export class MovementController {
  constructor(private readonly movementService: MovementService) { }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni stok hareketi oluştur (IN / OUT / SHIPMENT / TRANSFER)' })
  @Post()
  create(@Req() req, @Body() createMovementDto: CreateMovementDto) {
    const userId = req.user.userId;
    return this.movementService.create(createMovementDto, userId);
  }

  @ApiOperation({ summary: 'Tüm stok hareketlerini listele (sadece okuma)' })
  @Get()
  findAll() {
    return this.movementService.findAll();
  }

  @ApiOperation({ summary: 'ID ile tek bir stok hareketi getir' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movementService.findOne(id);
  }
}