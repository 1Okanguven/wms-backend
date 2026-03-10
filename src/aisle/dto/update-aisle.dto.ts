import { PartialType } from '@nestjs/swagger';
import { CreateAisleDto } from './create-aisle.dto';

export class UpdateAisleDto extends PartialType(CreateAisleDto) {}
