import { Controller, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AssignPickListDto } from './dto/assign-pick-list.dto';
import { CompletePickListDto } from './dto/complete-pick-list.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@ApiTags('Sipariş ve Toplama Yönetimi (Order & PickList)')
@Controller('order')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Yeni Sipariş Oluşturur (Akıllı Stok Eşleştirme ve PickList dahil)' })
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Post('pick-list/:id/complete')
  @Roles(UserRole.ADMIN, UserRole.WORKER)
  @ApiOperation({ summary: 'Toplama listesini tamamlar ve stok düşer' })
  completePickList(
    @Param('id') pickListId: string,
    @Req() req: any
  ) {
    const userId = req.user.userId || req.user.id;
    return this.orderService.completePickList(pickListId, userId);
  }

  @Post('all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Tüm siparişleri listeler' })
  findAll() {
    return this.orderService.findAll();
  }

  @Post('pick-lists')
  @Roles(UserRole.ADMIN, UserRole.WORKER)
  @ApiOperation({ summary: 'Tüm toplama listelerini getirir' })
  getAllPickLists() {
    return this.orderService.getAllPickLists();
  }

  @Post('pick-lists/warehouse/:warehouseId')
  @Roles(UserRole.ADMIN, UserRole.WORKER)
  @ApiOperation({ summary: 'Depo bazlı toplama listelerini getirir' })
  findPickListsByWarehouse(@Param('warehouseId') warehouseId: string) {
    return this.orderService.findPickListsByWarehouse(warehouseId);
  }
}

