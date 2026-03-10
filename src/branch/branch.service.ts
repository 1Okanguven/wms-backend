import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Branch } from './entities/branch.entity';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) { }

  async create(createBranchDto: CreateBranchDto) {

    const newBranch = this.branchRepository.create({
      name: createBranchDto.name,
      address: createBranchDto.address,
      company: { id: createBranchDto.companyId }
    });

    return await this.branchRepository.save(newBranch);
  }

  findAll() {
    return this.branchRepository.find();
  }

  findOne(id: string) {
    return this.branchRepository.findOneBy({ id });
  }

  update(id: string, updateBranchDto: UpdateBranchDto) {
    return `This action updates a #${id} branch`;
  }

  remove(id: string) {
    return `This action removes a #${id} branch`;
  }
}