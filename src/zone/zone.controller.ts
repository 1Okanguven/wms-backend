import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ZoneService } from './zone.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('zone')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class ZoneController {
  constructor(private readonly zoneService: ZoneService) { }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createZoneDto: CreateZoneDto) {
    return this.zoneService.create(createZoneDto);
  }

  @Roles(UserRole.ADMIN, UserRole.WORKER)
  @Get()
  findAll(@Req() req: any) {
    return this.zoneService.findAll(req.user);
  }

  @Roles(UserRole.ADMIN, UserRole.WORKER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zoneService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateZoneDto: UpdateZoneDto) {
    return this.zoneService.update(id, updateZoneDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.zoneService.remove(id);
  }
}
