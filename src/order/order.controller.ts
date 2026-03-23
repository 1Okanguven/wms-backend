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
  @ApiOperation({ summary: 'Yeni Sipariş Oluşturur (İşlemler Transaction içindedir)' })
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Post('assign-pick-list')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Siparişi bir Depo Görevlisine atar ve PickList oluşturur' })
  assignPickList(@Body() assignPickListDto: AssignPickListDto) {
    return this.orderService.assignPickList(assignPickListDto);
  }

  @Patch('pick-list/:id/complete')
  @Roles(UserRole.ADMIN, UserRole.WORKER)
  @ApiOperation({ summary: 'Toplama listesini (PickList) tamamlandı olarak işaretler, stok düşer ve hareket kaydeder' })
  completePickList(
    @Param('id') pickListId: string,
    @Body() completeDto: CompletePickListDto,
    @Req() req: any
  ) {
    const userId = req.user.userId || req.user.id;
    return this.orderService.completePickList(pickListId, completeDto, userId);
  }
}

