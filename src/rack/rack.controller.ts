import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RackService } from './rack.service';
import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('rack')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class RackController {
  constructor(private readonly rackService: RackService) { }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createRackDto: CreateRackDto) {
    return this.rackService.create(createRackDto);
  }

  @Roles(UserRole.ADMIN, UserRole.WORKER)
  @Get()
  findAll(@Req() req: any) {
    return this.rackService.findAll(req.user);
  }

  @Roles(UserRole.ADMIN, UserRole.WORKER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rackService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateRackDto: UpdateRackDto) {
    return this.rackService.update(id, updateRackDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.rackService.remove(id);
  }
}
