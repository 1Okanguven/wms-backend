import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AisleService } from './aisle.service';
import { CreateAisleDto } from './dto/create-aisle.dto';
import { UpdateAisleDto } from './dto/update-aisle.dto';

@Controller('aisle')
export class AisleController {
  constructor(private readonly aisleService: AisleService) { }

  @Post()
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
  update(@Param('id') id: string, @Body() updateAisleDto: UpdateAisleDto) {
    return this.aisleService.update(id, updateAisleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aisleService.remove(id);
  }
}
