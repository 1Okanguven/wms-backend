import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RackService } from './rack.service';
import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';

@Controller('rack')
export class RackController {
  constructor(private readonly rackService: RackService) { }

  @Post()
  create(@Body() createRackDto: CreateRackDto) {
    return this.rackService.create(createRackDto);
  }

  @Get()
  findAll() {
    return this.rackService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rackService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRackDto: UpdateRackDto) {
    return this.rackService.update(id, updateRackDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rackService.remove(id);
  }
}
