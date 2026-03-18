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
    const generatedBarcode = createProductDto.barcode
      ? createProductDto.barcode
      : `WMS-${createProductDto.sku}-${Date.now().toString().slice(-4)}`;

    const newProduct = this.productRepository.create({
      ...createProductDto,
      barcode: generatedBarcode,
      // Kategori ilişkisini bağlamıştık:
      category: { id: createProductDto.categoryId },
      // İŞTE UNUTTUĞUMUZ SATIR: Şirket ilişkisini de bağlamamız gerekiyor!
      company: { id: createProductDto.companyId },
    });

    return await this.productRepository.save(newProduct);
  }

  async findAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // İŞTE EKSİK OLAN SİHİRLİ SATIR BURASI:
    // Ürünleri çekerken, ilişkili olduğu kategori tablosunu da JSON içine dahil ediyoruz
    queryBuilder.leftJoinAndSelect('product.category', 'category');

    queryBuilder.leftJoinAndSelect('product.company', 'company');

    if (search) {
      queryBuilder.where('product.name ILIKE :search', { search: `%${search}%` })
        .orWhere('product.sku ILIKE :search', { search: `%${search}%` });
    }

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('product.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }


  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`ID'si ${id} olan ürün bulunamadı.`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const updateData: any = { ...updateProductDto };

    for (const key of Object.keys(updateData)) {
      if (key !== 'id' && key.endsWith('Id')) {
        const relationName = key.slice(0, -2);
        updateData[relationName] = { id: updateData[key] };
        delete updateData[key];
      }
    }

    const product = await this.productRepository.preload({
      id,
      ...updateData,
    });

    if (!product) {
      throw new NotFoundException(`ID'si ${id} olan ürün güncellenemedi, bulunamadı.`);
    }

    return await this.productRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    return await this.productRepository.remove(product);
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