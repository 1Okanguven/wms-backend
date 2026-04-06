import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.WORKER)
  create(@Body() createInventoryDto: CreateInventoryDto, @Req() req: any) {
    return this.inventoryService.create(createInventoryDto, req.user.userId);
  }

  @Roles(UserRole.ADMIN, UserRole.WORKER)
  @Get()
  findAll(@Req() req: any) {
    return this.inventoryService.findAll(req.user);
  }

  @Roles(UserRole.ADMIN, UserRole.WORKER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.WORKER)
  update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Roles(UserRole.ADMIN, UserRole.WORKER)
  @Get('warehouse/:warehouseId')
  findByWarehouse(@Param('warehouseId') warehouseId: string, @Req() req: any) {
    const user = req.user;
    const targetWarehouseId = (user.role === 'WORKER' && user.warehouseId) ? user.warehouseId : warehouseId;
    return this.inventoryService.findByWarehouse(targetWarehouseId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
