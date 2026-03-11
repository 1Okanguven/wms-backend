import { MovementType } from '../entities/movement.entity';

export class CreateMovementDto {
    type: MovementType;
    quantity: number;
    productId: string;
    sourceRackId?: string;
    destinationRackId?: string;
}