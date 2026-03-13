import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AisleService } from './aisle.service';
import { CreateAisleDto } from './dto/create-aisle.dto';
import { UpdateAisleDto } from './dto/update-aisle.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('aisle')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class AisleController {
  constructor(private readonly aisleService: AisleService) { }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createAisleDto: CreateAisleDto) {
    return this.aisleService.create(createAisleDto);
  }

  @Get()
  findAll() {
    return this.aisleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aisleService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateAisleDto: UpdateAisleDto) {
    return this.aisleService.update(id, updateAisleDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.aisleService.remove(id);
  }
}
