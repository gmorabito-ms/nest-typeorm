import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './product-image.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  title: string;

  @Column('float', {
    default: 0, // default value
  })
  price: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;
  
  @Column({
    unique: true,
  })
  slug: string;

  @Column('int', {
    default: 0,
  })
  stock: number;

  @Column('text', {
    array: true,
  })
  sizes: string[];

  @Column('text')
  gender: string;

  @Column({
    type:'text',
    array:true,
    default:[]
  })
  tags: string[]


  // one product many imgs
  @OneToMany( // relation
    () => ProductImage,
    (producImage) => producImage.product,
    {cascade:true, // any operation related will affect
    eager:true} // will also bring all related data
  )
  images?:ProductImage[]

  @BeforeInsert()
  checkSlugInsert() {
    // automatic slug
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .toLocaleLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate(){
    this.slug = this.slug
      .toLocaleLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
