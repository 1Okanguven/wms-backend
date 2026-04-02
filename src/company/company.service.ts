import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) { }

  async create(createCompanyDto: CreateCompanyDto) {
    const newCompany = this.companyRepository.create(createCompanyDto);
    return await this.companyRepository.save(newCompany);
  }

  async findAll() {
    return await this.companyRepository.find();
  }

  async findOne(id: string) {
    const company = await this.companyRepository.findOneBy({ id });
    if (!company) {
      throw new NotFoundException(`ID'si ${id} olan şirket/hub bulunamadı.`);
    }
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const updateData: any = { ...updateCompanyDto };

    for (const key of Object.keys(updateData)) {
      if (key !== 'id' && key.endsWith('Id')) {
        const relationName = key.slice(0, -2);
        updateData[relationName] = { id: updateData[key] };
        delete updateData[key];
      }
    }

    if (updateData.name) {
      const existing = await this.companyRepository.findOneBy({
        name: updateData.name,
        id: Not(id)
      });
      if (existing) {
        throw new ConflictException(`'${updateData.name}' isimli şirket zaten mevcut.`);
      }
    }

    const company = await this.companyRepository.preload({
      id: id,
      ...updateData,
    });

    if (!company) {
      throw new NotFoundException(`ID'si ${id} olan şirket güncellenemedi, bulunamadı.`);
    }

    return await this.companyRepository.save(company);
  }

  async remove(id: string) {
    const company = await this.findOne(id);
    return await this.companyRepository.remove(company);
  }
}