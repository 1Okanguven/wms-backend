import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { GetProductsFilterDto } from './dto/get-products-filter.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    const newProduct = this.productRepository.create({
      name: createProductDto.name,
      sku: createProductDto.sku,
      barcode: createProductDto.barcode,
      category: { id: createProductDto.categoryId },
      company: { id: createProductDto.companyId }
    });

    return await this.productRepository.save(newProduct);
  }


  async findAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    const query = this.productRepository.createQueryBuilder('product');

    if (search) {
      query.where('product.name ILIKE :search OR product.sku ILIKE :search', { search: `%${search}%` });
    }

    query.skip(skip).take(limit);
    query.orderBy('product.createdAt', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }


  findOne(id: string) {
    return this.productRepository.findOneBy({ id });
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: string) {
    return `This action removes a #${id} product`;
  }

  async uploadImage(id: string, imageUrl: string) {
    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException(`ID'si ${id} olan ürün bulunamadı.`);
    }

    product.imageUrl = imageUrl;
    return this.productRepository.save(product);
  }
}