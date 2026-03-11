import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './company/company.module';
import { BranchModule } from './branch/branch.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { ZoneModule } from './zone/zone.module';
import { AisleModule } from './aisle/aisle.module';
import { RackModule } from './rack/rack.module';
import { ProductModule } from './product/product.module';
import { InventoryModule } from './inventory/inventory.module';
import { MovementModule } from './movement/movement.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'wms_admin',
      password: 'wms_password',
      database: 'wms_db',
      entities: [],
      autoLoadEntities: true,
      synchronize: true, // Geliştirme ortamı için harika bir özellik!
    }),
    CompanyModule,
    BranchModule,
    WarehouseModule,
    ZoneModule,
    AisleModule,
    RackModule,
    ProductModule,
    InventoryModule,
    MovementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }