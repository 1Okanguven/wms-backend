import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
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
    const { companyId, ...rest } = createBranchDto;
    const newBranch = this.branchRepository.create({
      ...rest,
      company: { id: companyId }
    });

    return await this.branchRepository.save(newBranch);
  }

  findAll() {
    return this.branchRepository.find({
      relations: ['company'],
    });
  }

  async findOne(id: string) {
    const branch = await this.branchRepository.findOneBy({ id });
    if (!branch) {
      throw new NotFoundException(`ID'si ${id} olan şube bulunamadı.`);
    }
    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto) {
    const updateData: any = { ...updateBranchDto };

    for (const key of Object.keys(updateData)) {
      if (key !== 'id' && key.endsWith('Id')) {
        const relationName = key.slice(0, -2);
        updateData[relationName] = { id: updateData[key] };
        delete updateData[key];
      }
    }

    if (updateData.name) {
      const existing = await this.branchRepository.findOneBy({
        name: updateData.name,
        id: Not(id)
      });
      if (existing) {
        throw new ConflictException(`'${updateData.name}' isimli şube zaten mevcut.`);
      }
    }

    const branch = await this.branchRepository.preload({
      id,
      ...updateData,
    });

    if (!branch) {
      throw new NotFoundException(`ID'si ${id} olan şube güncellenemedi, bulunamadı.`);
    }

    return await this.branchRepository.save(branch);
  }

  async remove(id: string) {
    const branch = await this.findOne(id);
    return await this.branchRepository.remove(branch);
  }
}