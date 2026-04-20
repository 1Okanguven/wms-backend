import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogService } from './audit-log.service';
import { ScheduleModule } from '@nestjs/schedule';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    ScheduleModule.forRoot(),
  ],
  providers: [AuditLogService],
  exports: [AuditLogService], 
})
export class AuditLogModule {}
