import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  findAll() {
    return this.companyRepository.find();
  }

  findOne(id: string) {
    return this.companyRepository.findOneBy({ id });
  }

  update(id: string, updateCompanyDto: UpdateCompanyDto) {
    return `This action updates a #${id} company`;
  }

  remove(id: string) {
    return `This action removes a #${id} company`;
  }
}