import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'wms_admin',
      password: 'wms_password',
      database: 'wms_db',
      entities: [],
      autoLoadEntities: true,
      synchronize: true,
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
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }