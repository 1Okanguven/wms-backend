import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MovementService } from './movement.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';

@Controller('movement')
export class MovementController {
  constructor(private readonly movementService: MovementService) { }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post()
  create(@Req() req, @Body() createMovementDto: CreateMovementDto) { // @Req eklendi
    // Bekçi (Guard) kartı onayladığında, karttaki bilgileri otomatik olarak "req.user" içine koyar.
    // Biz de jwt.strategy.ts'de ayarladığımız o "userId" değerini çekiyoruz:
    const userId = req.user.userId;

    // İşlemi yaparken artık ID'yi de servise fısıldıyoruz
    return this.movementService.create(createMovementDto, userId);
  }

  @Get()
  findAll() {
    return this.movementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movementService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMovementDto: UpdateMovementDto) {
    return this.movementService.update(id, updateMovementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movementService.remove(id);
  }
}