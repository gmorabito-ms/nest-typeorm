import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { Product } from 'src/products/entities/product.entity';


@Injectable()
export class SeedService {

  constructor(
    private readonly productsService:ProductsService
  ){}

  async runSeed(){
    await this.insertNewProducts()
    return 'seed executed'
  }

  private async insertNewProducts(){
    await this.productsService.deleteAllProducts()

    const products = initialData.products
    const insertPromises:any = []

    products.forEach(product => {
      insertPromises.push(this.productsService.create(product))
    })

    await Promise.all(insertPromises)

    return true
  }
}
