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
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DashboardModule } from './dashboard/dashboard.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { ReceivingModule } from './receiving/receiving.module';
import { ShippingModule } from './shipping/shipping.module';
import { TransferModule } from './transfer/transfer.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { NotificationModule } from './notifications/notification.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // 1. EKLENEN KISIM: Throttle modülünü projeye dahil edip limitleri belirliyoruz
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 saniye zaman penceresi
      limit: 100, // 60 saniyede 100 isteğe izin ver (admin paneli için uygun)
    }]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: process.env.POSTGRES_USER || 'wms_admin',
      password: process.env.POSTGRES_PASSWORD || 'wms_password',
      database: process.env.POSTGRES_DB || 'wms_db',
      entities: [],
      autoLoadEntities: true,
      synchronize: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      playground: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    CompanyModule,
    NotificationModule,
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
    DashboardModule,
    CategoryModule,
    OrderModule,
    ReceivingModule,
    ShippingModule,
    TransferModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 2. EKLENEN KISIM: Korumayı tüm projedeki controller'lara (global) uygulamak için ekliyoruz
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule { }