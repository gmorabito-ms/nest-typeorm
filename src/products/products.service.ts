import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dtos';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product) // nest/typeorm
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage) // nest/typeorm
    private readonly productImageRepository: Repository<ProductImage>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      const {images = [], ...productDetails} = createProductDto // images and details of the product are divided
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({url:image}))
      });
      await this.productRepository.save(product);
      return {...product, images:images};
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations:{
        images:true
      }
    })

    return products.map(product => ({
      ...product,
      images: product.images?.map(img => img.url) // shows only the img url
    }))
  }

  async findOne(term: string) {

    let product: Product | null;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      // product = await this.productRepository.findOneBy({slug: term})
      const queryBuilder = await this.productRepository.createQueryBuilder('prod')
      product = await queryBuilder
        .where('LOWER(title) =:title or slug =:slug', { // searches in col title and the value === title, then the same with slug 
          title: term.toLowerCase(),
          slug: term
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne() // sometimes can bring more thant one
    }


    if (!product) {
      throw new BadRequestException(`Product with ${term} does not exists`)
    }
    return product
  }

  async findOnePlain(term:string){
    const product = await this.findOne(term)
    return {
      ...product,
      images: product.images?.map(img =>img.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productRepository.preload({ // loads the new data into the item (doesnt update)
        id,
        ...updateProductDto,
        images:[]
      })

      if (!product) throw new NotFoundException(`Product with ${id} not found`)

      await this.productRepository.save(product) // update
      return product
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id)
    await this.productRepository.remove(product)
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check logs');
  }
}