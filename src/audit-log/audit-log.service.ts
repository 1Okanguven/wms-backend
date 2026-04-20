import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(data: Partial<AuditLog>): Promise<void> {
    try {
      const log = this.auditLogRepository.create(data);
      await this.auditLogRepository.save(log);
    } catch (error) {
      console.error('Audit Log Error:', error);
    }
  }

  @Cron('0 3 * * *')
  async handleCron() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deleteResult = await this.auditLogRepository.delete({
      createdAt: LessThan(thirtyDaysAgo),
    });

    console.log(`[AuditLog CleanUp] Deleted: ${deleteResult.affected}`);
  }
}
